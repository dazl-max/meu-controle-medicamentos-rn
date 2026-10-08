import AsyncStorage from "@react-native-async-storage/async-storage";

const CHAVE_MEDICAMENTOS = "medicamentos";
const CHAVE_ALERTAS = "alertasDisparados";
const CHAVE_SOM_ALARME = "somAlarmeAtivado";

/* ---------- Medicamentos ---------- */
export async function carregarMedicamentos() {
  try {
    const dados = JSON.parse(await AsyncStorage.getItem(CHAVE_MEDICAMENTOS));
    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

export async function salvarMedicamentos(lista) {
  await AsyncStorage.setItem(CHAVE_MEDICAMENTOS, JSON.stringify(lista));
}

export async function adicionarMedicamento(nome, dose, horario) {
  const lista = await carregarMedicamentos();
  const novo = {
    id: Date.now(),
    nome,
    dose,
    horario, // "HH:MM"
    tomado: false,
    dataTomado: null,
    notificacaoId: null, // id da notificação nativa agendada, para poder cancelar
  };
  lista.push(novo);
  await salvarMedicamentos(lista);
  return novo;
}

export async function excluirMedicamento(id) {
  const lista = await carregarMedicamentos();
  const restante = lista.filter((m) => m.id !== id);
  await salvarMedicamentos(restante);
}

export async function marcarComoTomado(id, dataDeHoje) {
  const lista = await carregarMedicamentos();
  const med = lista.find((m) => m.id === id);
  if (med) {
    med.tomado = true;
    med.dataTomado = dataDeHoje;
    await salvarMedicamentos(lista);
  }
}

export async function definirNotificacaoIdDoMedicamento(id, notificacaoId) {
  const lista = await carregarMedicamentos();
  const med = lista.find((m) => m.id === id);
  if (med) {
    med.notificacaoId = notificacaoId;
    await salvarMedicamentos(lista);
  }
}

/* ---------- Registro de alertas já disparados hoje (evita repetição) ---------- */
export async function carregarAlertas() {
  try {
    const dados = JSON.parse(await AsyncStorage.getItem(CHAVE_ALERTAS));
    return Array.isArray(dados) ? dados : [];
  } catch {
    return [];
  }
}

export async function registrarAlertaDisparado(medicamentoId, dataDeHoje) {
  const alertas = await carregarAlertas();
  alertas.push({ medicamentoId, data: dataDeHoje, alertado: true });
  await AsyncStorage.setItem(CHAVE_ALERTAS, JSON.stringify(alertas));
}

export async function jaAlertadoHoje(medicamentoId, dataDeHoje) {
  const alertas = await carregarAlertas();
  return alertas.some(
    (a) => a.medicamentoId === medicamentoId && a.data === dataDeHoje && a.alertado
  );
}

export async function limparAlertasAntigos(dataDeHoje) {
  const alertas = (await carregarAlertas()).filter((a) => a.data === dataDeHoje);
  await AsyncStorage.setItem(CHAVE_ALERTAS, JSON.stringify(alertas));
}

/* ---------- Preferência do som do alarme ---------- */
export async function somAlarmeEstaAtivado() {
  const valor = await AsyncStorage.getItem(CHAVE_SOM_ALARME);
  return valor !== "false";
}

export async function definirSomAlarme(ativado) {
  await AsyncStorage.setItem(CHAVE_SOM_ALARME, ativado ? "true" : "false");
}
