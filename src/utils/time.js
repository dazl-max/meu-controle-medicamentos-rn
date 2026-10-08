export function dataDeHoje() {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export function horaAtualHHMM() {
  const agora = new Date();
  const h = String(agora.getHours()).padStart(2, "0");
  const m = String(agora.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export function statusConsiderandoODia(med) {
  return med.tomado && med.dataTomado === dataDeHoje();
}

export function formatarMinutos(totalMinutos) {
  if (totalMinutos <= 0) return "menos de 1 minuto";
  const horas = Math.floor(totalMinutos / 60);
  const minutos = totalMinutos % 60;
  if (horas === 0) return `${minutos} minuto${minutos !== 1 ? "s" : ""}`;
  if (minutos === 0) return `${horas} hora${horas !== 1 ? "s" : ""}`;
  return `${horas}h ${minutos}min`;
}

/* Encontra o próximo medicamento pendente e quantos minutos faltam. */
export function calcularProximoPendente(medicamentos) {
  const pendentes = medicamentos.filter((m) => !statusConsiderandoODia(m));
  if (pendentes.length === 0) return null;

  const agora = new Date();
  const minutosAgora = agora.getHours() * 60 + agora.getMinutes();

  let proximo = null;
  let menorDiferenca = Infinity;

  pendentes.forEach((med) => {
    const [h, m] = med.horario.split(":").map(Number);
    const minutosMed = h * 60 + m;
    let diferenca = minutosMed - minutosAgora;
    if (diferenca < 0) diferenca += 24 * 60;
    if (diferenca < menorDiferenca) {
      menorDiferenca = diferenca;
      proximo = med;
    }
  });

  return { proximo, minutosRestantes: menorDiferenca };
}
