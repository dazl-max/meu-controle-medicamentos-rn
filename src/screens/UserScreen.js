import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, ScrollView, Pressable, Text, StyleSheet } from "react-native";

import { cores, fontes, espaco } from "../theme";
import Header from "../components/Header";
import SummaryRing from "../components/SummaryRing";
import MedicationForm from "../components/MedicationForm";
import MedicationList from "../components/MedicationList";
import AlertModal from "../components/AlertModal";

import { supabase } from "../utils/supabase";
import {
  carregarMedicamentosCloud,
  adicionarMedicamentoCloud,
  excluirMedicamentoCloud,
  marcarComoTomadoCloud,
  carregarRegistrosDeHoje,
} from "../utils/cloudData";
import {
  jaAlertadoHoje,
  registrarAlertaDisparado,
  limparAlertasAntigos,
  somAlarmeEstaAtivado,
  definirSomAlarme,
} from "../utils/storage";
import { dataDeHoje, horaAtualHHMM, calcularProximoPendente } from "../utils/time";
import { agendarNotificacaoDiaria, cancelarNotificacao } from "../utils/notifications";
import { tocarSomAlerta } from "../utils/sound";

const INTERVALO_VERIFICACAO_MS = 5000;
const INTERVALO_ATUALIZACAO_NUVEM_MS = 30000;
const INTERVALO_REPETICAO_SOM_MS = 15000;

export default function UserScreen({ session }) {
  const usuarioId = session.user.id;

  const [medicamentos, setMedicamentos] = useState([]);
  const [registrosHoje, setRegistrosHoje] = useState([]);
  const [somLigado, setSomLigado] = useState(true);
  const [modalMedicamento, setModalMedicamento] = useState(null);

  // Refs com os dados mais recentes: assim a verificação periódica fica estável
  // (não é recriada a cada atualização de estado, o que causava um loop de requisições).
  const medicamentosRef = useRef([]);
  const registrosRef = useRef([]);
  const somLigadoRef = useRef(true);
  medicamentosRef.current = medicamentos;
  registrosRef.current = registrosHoje;
  somLigadoRef.current = somLigado;

  const idAguardandoConfirmacao = useRef(null);
  const intervaloSom = useRef(null);

  const recarregar = useCallback(async () => {
    const [meds, regs] = await Promise.all([
      carregarMedicamentosCloud(usuarioId),
      carregarRegistrosDeHoje(usuarioId),
    ]);
    setMedicamentos(meds);
    setRegistrosHoje(regs);
  }, [usuarioId]);

  useEffect(() => {
    (async () => {
      await limparAlertasAntigos(dataDeHoje());
      setSomLigado(await somAlarmeEstaAtivado());
      await recarregar();
    })();
  }, [recarregar]);

  /* Mescla o status de hoje (registros_dose) dentro de cada medicamento,
     no mesmo formato que os componentes visuais já esperam. */
  const medicamentosComStatus = medicamentos.map((med) => {
    const registro = registrosHoje.find((r) => r.medicamento_id === med.id);
    return {
      ...med,
      tomado: registro?.status === "tomado",
      dataTomado: registro?.status === "tomado" ? dataDeHoje() : null,
    };
  });

  /* ---------- Som repetido até confirmar ---------- */
  const pararRepeticaoSom = useCallback(() => {
    if (intervaloSom.current) clearInterval(intervaloSom.current);
    intervaloSom.current = null;
    idAguardandoConfirmacao.current = null;
  }, []);

  const iniciarRepeticaoSom = useCallback(
    (medicamentoId) => {
      pararRepeticaoSom();
      idAguardandoConfirmacao.current = medicamentoId;
      intervaloSom.current = setInterval(() => {
        if (somLigadoRef.current) tocarSomAlerta();
      }, INTERVALO_REPETICAO_SOM_MS);
    },
    [pararRepeticaoSom]
  );

  /* ---------- Verificação periódica (card visual + som) ---------- */
  const verificarHorarios = useCallback(async () => {
    const hoje = dataDeHoje();
    await limparAlertasAntigos(hoje);

    const horaAtual = horaAtualHHMM();

    for (const med of medicamentosRef.current) {
      const jaTomado = registrosRef.current.some((r) => r.medicamento_id === med.id && r.status === "tomado");
      if (jaTomado) continue;
      if (med.horario.slice(0, 5) !== horaAtual) continue;
      if (await jaAlertadoHoje(med.id, hoje)) continue;

      setModalMedicamento(med);
      if (somLigadoRef.current) tocarSomAlerta();
      iniciarRepeticaoSom(med.id);
      await registrarAlertaDisparado(med.id, hoje);
    }
  }, [iniciarRepeticaoSom]);

  /* Atualiza os dados da nuvem de tempos em tempos (bem mais espaçado que a verificação de horário). */
  useEffect(() => {
    const id = setInterval(recarregar, INTERVALO_ATUALIZACAO_NUVEM_MS);
    return () => clearInterval(id);
  }, [recarregar]);

  useEffect(() => {
    verificarHorarios();
    const id = setInterval(verificarHorarios, INTERVALO_VERIFICACAO_MS);
    return () => clearInterval(id);
  }, [verificarHorarios]);

  /* ---------- Ações ---------- */
  async function adicionarMedicamento(nome, dose, horario) {
    const novo = await adicionarMedicamentoCloud(usuarioId, nome, dose, horario);
    try {
      await agendarNotificacaoDiaria(novo);
    } catch {
      /* se o agendamento nativo falhar, a verificação em primeiro plano continua funcionando */
    }
    await recarregar();
  }

  async function excluirMedicamento(id) {
    await excluirMedicamentoCloud(id);
    if (id === idAguardandoConfirmacao.current) pararRepeticaoSom();
    if (modalMedicamento?.id === id) setModalMedicamento(null);
    await recarregar();
  }

  async function marcarComoTomado(id) {
    await marcarComoTomadoCloud(id, usuarioId);
    if (id === idAguardandoConfirmacao.current) pararRepeticaoSom();
    await recarregar();
  }

  function confirmarNoModal() {
    if (modalMedicamento) marcarComoTomado(modalMedicamento.id);
    setModalMedicamento(null);
  }

  function fecharModal() {
    setModalMedicamento(null); // medicamento continua pendente; o som segue repetindo
  }

  async function alternarSom() {
    const novoValor = !somLigado;
    setSomLigado(novoValor);
    await definirSomAlarme(novoValor);
  }

  const { proximo, minutosRestantes } = calcularProximoPendente(medicamentosComStatus) || {};
  const horaDeTomarAgora = proximo ? proximo.horario.slice(0, 5) === horaAtualHHMM() : false;
  const tudoTomado = medicamentosComStatus.length > 0 && !proximo;

  return (
    <View style={estilos.raiz}>
      <ScrollView contentContainerStyle={estilos.conteudo}>
        <Header somLigado={somLigado} onAlternarSom={alternarSom} dica="" onSair={() => supabase.auth.signOut()} />

        <View style={estilos.secoes}>
          <SummaryRing
            proximo={proximo}
            minutosRestantes={minutosRestantes}
            horaDeTomarAgora={horaDeTomarAgora}
            tudoTomado={tudoTomado}
            temMedicamentos={medicamentosComStatus.length > 0}
          />
          <MedicationForm onAdicionar={adicionarMedicamento} />
          <MedicationList
            medicamentos={medicamentosComStatus}
            onTomar={marcarComoTomado}
            onExcluir={excluirMedicamento}
          />
        </View>
      </ScrollView>

      <AlertModal
        visivel={!!modalMedicamento}
        medicamento={modalMedicamento}
        onTomei={confirmarNoModal}
        onFechar={fecharModal}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: cores.bg },
  conteudo: { paddingBottom: 48 },
  secoes: { padding: espaco.md, gap: espaco.lg },
  sairWrap: { paddingHorizontal: espaco.md, paddingTop: espaco.sm },
  sair: { fontFamily: fontes.corpoSemiNegrito, color: cores.tintaSuave, fontSize: 13 },
});