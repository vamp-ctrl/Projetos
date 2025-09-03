// ====== Estado inicial ======
let comandas = JSON.parse(localStorage.getItem("comandasAbertas") || "[]");
let comandaSelecionada = null;
let pagamentos = [];
let nextPedidoId = Number(localStorage.getItem("nextPedidoId") || 1);

// ====== UTIL ======
const $ = (id) => document.getElementById(id);

function gerarId() {
  const id = nextPedidoId++;
  localStorage.setItem("nextPedidoId", nextPedidoId);
  return id;
}

function salvar() {
  localStorage.setItem("comandasAbertas", JSON.stringify(comandas));
}

// ====== Abrir nova comanda ======
function abrirComanda() {
  if (localStorage.getItem("caixaAberto") !== "true") {
    return alert("Abra o caixa antes de abrir uma comanda!");
  }

  const nome = $("nomeComanda").value.trim();
  if (!nome) return alert("Digite um nome ou número para a comanda!");

  const nova = { id: gerarId(), nome, itens: [], total: 0 };
  comandas.push(nova);
  salvar();
  listarComandas();
  $("nomeComanda").value = "";
}

// ====== Listar comandas ======
function listarComandas() {
  const lista = $("comandasAbertas");
  lista.innerHTML = "";

  comandas.forEach(({ id, nome, total }) => {
    const li = document.createElement("li");
    li.textContent = `${nome} - R$ ${total.toFixed(2)}`;
    li.onclick = () => selecionarComanda(id);
    lista.appendChild(li);
  });
}

// ====== Selecionar comanda ======
function selecionarComanda(id) {
  comandaSelecionada = comandas.find((c) => c.id === id);
  if (!comandaSelecionada) return;

  $("detalhesComanda").style.display = "block";
  $("tituloComanda").textContent = `Comanda: ${comandaSelecionada.nome}`;
  renderizarItens();
}

// ====== Adicionar item ======
function adicionarItem(tipo) {
  if (!comandaSelecionada) return alert("Selecione uma comanda!");

  const valor = parseFloat(prompt(`Digite o valor do ${tipo} (R$):`));
  if (isNaN(valor) || valor <= 0) return alert("Valor inválido!");

  comandaSelecionada.itens.push({ tipo, valor });
  comandaSelecionada.total += valor;
  salvar();
  renderizarItens();
}

// ====== Renderizar itens ======
function renderizarItens() {
  const lista = $("itensComanda");
  lista.innerHTML = "";

  comandaSelecionada.itens.forEach((item, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${item.tipo} - R$ ${item.valor.toFixed(2)}
      <button onclick="removerItem(${i})">Remover</button>
    `;
    lista.appendChild(li);
  });

  $("totalComanda").textContent = comandaSelecionada.total.toFixed(2);
}

// ====== Remover item ======
function removerItem(i) {
  const item = comandaSelecionada.itens[i];
  comandaSelecionada.total -= item.valor;
  comandaSelecionada.itens.splice(i, 1);
  salvar();
  renderizarItens();
}

// ====== Pagamento ======
function fecharComanda() {
  if (!comandaSelecionada) return alert("Selecione uma comanda!");
  if (comandaSelecionada.itens.length === 0) return alert("A comanda está vazia!");

  pagamentos = [];
  $("valorTotal").textContent = comandaSelecionada.total.toFixed(2);
  $("listaPagamentos").innerHTML = "";
  $("modalPagamento").classList.remove("hidden");
}

function fecharModal() {
  $("modalPagamento").classList.add("hidden");
}

// Mostrar/ocultar campo de troco
$("formaPagamento").addEventListener("change", () => {
  const forma = $("formaPagamento").value;
  $("campoTroco").style.display = forma === "Dinheiro" ? "block" : "none";

  const totalPago = pagamentos.reduce((acc, p) => acc + p.valor, 0);
  const restante = comandaSelecionada.total - totalPago;
  $("valorPagamento").value = forma === "Dinheiro" ? restante.toFixed(2) : "";
  $("valorRecebido").value = "";
  $("troco").textContent = "0.00";
});

// Calcular troco
$("valorRecebido").addEventListener("input", () => {
  const recebido = parseFloat($("valorRecebido").value);
  const valor = parseFloat($("valorPagamento").value);
  $("troco").textContent =
    !isNaN(recebido) && !isNaN(valor) && recebido >= valor
      ? (recebido - valor).toFixed(2)
      : "0.00";
});

// Adicionar pagamento
function adicionarPagamento() {
  const forma = $("formaPagamento").value;
  let valor = parseFloat($("valorPagamento").value);
  if (!forma || isNaN(valor) || valor <= 0) return alert("Preencha corretamente a forma e o valor!");

  const totalPago = pagamentos.reduce((acc, p) => acc + p.valor, 0);
  const restante = comandaSelecionada.total - totalPago;
  if (valor > restante) valor = restante;

  const pagamento = { forma, valor };

  if (forma === "Dinheiro") {
    const recebido = parseFloat($("valorRecebido").value);
    if (isNaN(recebido) || recebido < valor) return alert("Valor recebido inválido!");
    pagamento.recebido = recebido;
    pagamento.troco = recebido - valor;
  }

  pagamentos.push(pagamento);

  const li = document.createElement("li");
  li.textContent =
    forma === "Dinheiro"
      ? `${forma} - R$ ${valor.toFixed(2)} (Recebido: R$ ${pagamento.recebido.toFixed(2)}, Troco: R$ ${pagamento.troco.toFixed(2)})`
      : `${forma} - R$ ${valor.toFixed(2)}`;
  $("listaPagamentos").appendChild(li);

  $("valorPagamento").value = "";
  $("valorRecebido").value = "";
  $("troco").textContent = "0.00";
  $("formaPagamento").value = "";
  $("campoTroco").style.display = "none";
}

// Finalizar pagamento
function finalizarPagamento() {
  if (!comandaSelecionada) return;

  let totalPago = pagamentos.reduce((acc, p) => acc + p.valor, 0);
  const valorCampo = parseFloat($("valorPagamento").value);
  const formaCampo = $("formaPagamento").value;
  const recebidoCampo = parseFloat($("valorRecebido").value);

  if (formaCampo && !isNaN(valorCampo) && valorCampo > 0) {
    if (formaCampo === "Dinheiro") {
      if (isNaN(recebidoCampo) || recebidoCampo < valorCampo) return alert("Valor recebido inválido!");
      totalPago += valorCampo;
    } else totalPago += valorCampo;
  }

  if (totalPago < comandaSelecionada.total) return alert("O pagamento ainda não cobre o valor total!");

  const novoPedido = {
    id: comandaSelecionada.id,
    vendedor: localStorage.getItem("usuarioLogado") || "Desconhecido",
    total: comandaSelecionada.total,
    pagamentos,
    descricao: `Fechamento da comanda ${comandaSelecionada.nome}`,
    dataHora: new Date().toLocaleString(),
  };

  const chaveHistorico = "historicoFechamento-" + new Date().toISOString().split("T")[0];
  const historicoDoDia = JSON.parse(localStorage.getItem(chaveHistorico) || "[]");
  historicoDoDia.push(novoPedido);
  localStorage.setItem(chaveHistorico, JSON.stringify(historicoDoDia));

  alert("Comanda fechada e registrada no histórico!");
  fecharModal();
  removerComanda();
  window.location.href = "/Projetos/Menu/Histórico/historico.html";
}

// Cancelar comanda
function cancelarComanda() {
  if (confirm("Cancelar essa comanda?")) removerComanda();
}

// Remover comanda
function removerComanda() {
  comandas = comandas.filter((c) => c.id !== comandaSelecionada.id);
  salvar();
  listarComandas();
  $("detalhesComanda").style.display = "none";
  comandaSelecionada = null;
}

// ====== Eventos ======
document.addEventListener("DOMContentLoaded", () => {
  $("btnAbrir").addEventListener("click", abrirComanda);
  $("btnAddAcai").addEventListener("click", () => adicionarItem("Açaí"));
  $("btnAddProduto").addEventListener("click", () => adicionarItem("Produto"));
  $("btnFecharComanda").addEventListener("click", fecharComanda);
  $("btnCancelar").addEventListener("click", cancelarComanda);
  $("btnAddPagamento").addEventListener("click", adicionarPagamento);
  $("btnFinalizarPagamento").addEventListener("click", finalizarPagamento);
  $("btnCancelarPagamento").addEventListener("click", fecharModal);

  listarComandas();
});
