let comandas = JSON.parse(localStorage.getItem("comandasAbertas") || "[]");
let comandaSelecionada = null;

function salvar() {
  localStorage.setItem("comandasAbertas", JSON.stringify(comandas));
}

// ===== Abrir nova comanda =====
function abrirComanda() {
  // Pega o valor do caixa e transforma em booleano
  const caixaAberto = localStorage.getItem("caixaAberto") === "true";

  if (!caixaAberto) {
    alert("Abra o caixa antes de abrir uma comanda!");
    return;
  }

  const nome = document.getElementById("nomeComanda").value.trim();
  if (!nome) {
    alert("Digite um nome ou número para a comanda!");
    return;
  }

  const nova = {
    id: Date.now(),
    nome: nome,
    itens: [],
    total: 0
  };

  comandas.push(nova);
  salvar();
  listarComandas();
  document.getElementById("nomeComanda").value = "";
}




// ===== Mostrar lista de comandas abertas =====
function listarComandas() {
  const lista = document.getElementById("comandasAbertas");
  lista.innerHTML = "";

  comandas.forEach(c => {
    const li = document.createElement("li");
    li.textContent = `${c.nome} - R$ ${c.total.toFixed(2)}`;
    li.onclick = () => selecionarComanda(c.id);
    lista.appendChild(li);
  });
}

// ===== Selecionar comanda =====
function selecionarComanda(id) {
  comandaSelecionada = comandas.find(c => c.id === id);
  if (!comandaSelecionada) return;

  document.getElementById("detalhesComanda").style.display = "block";
  document.getElementById("tituloComanda").textContent =
    `Comanda: ${comandaSelecionada.nome}`;

  renderizarItens();
}

// ===== Adicionar item =====
function adicionarItem(tipo) {
  const valor = prompt(`Digite o valor do ${tipo} (R$):`);
  const v = parseFloat(valor);
  if (isNaN(v) || v <= 0) {
    alert("Valor inválido!");
    return;
  }

  comandaSelecionada.itens.push({ tipo, valor: v });
  comandaSelecionada.total += v;
  salvar();
  renderizarItens();
}

// ===== Renderizar itens =====
function renderizarItens() {
  const lista = document.getElementById("itensComanda");
  lista.innerHTML = "";

  comandaSelecionada.itens.forEach((item, i) => {
    const li = document.createElement("li");
    li.innerHTML = `${item.tipo} - R$ ${item.valor.toFixed(2)}
      <button onclick="removerItem(${i})">Remover</button>`;
    lista.appendChild(li);
  });

  document.getElementById("totalComanda").textContent =
    comandaSelecionada.total.toFixed(2);
}

// ===== Remover item =====
function removerItem(i) {
  const item = comandaSelecionada.itens[i];
  comandaSelecionada.total -= item.valor;
  comandaSelecionada.itens.splice(i, 1);
  salvar();
  renderizarItens();
}

function fecharComanda() {
  if (comandaSelecionada.itens.length === 0) {
    alert("A comanda está vazia!");
    return;
  }
  // Abre o modal de pagamento
  document.getElementById("modalPagamento").classList.remove("hidden");
}

function fecharModal() {
  document.getElementById("modalPagamento").classList.add("hidden");
}

function confirmarPagamento() {
  const formaPagamento = document.getElementById("formaPagamento").value;

  if (!formaPagamento) {
    alert("Escolha uma forma de pagamento!");
    return;
  }

  const totalComanda = comandaSelecionada.itens.reduce((acc, item) => acc + item.valor, 0);

  const novoPedido = {
    id: `${comandaSelecionada.nome}`, // corrigido
    vendedor: localStorage.getItem("usuarioLogado") || "Desconhecido",
    total: totalComanda,
    pagamentos: [{ forma: formaPagamento, valor: totalComanda }],
    descricao: `Fechamento da comanda ${comandaSelecionada.nome}`,
    dataHora: new Date().toLocaleString()
  };

  const dataHoje = new Date().toLocaleDateString();
  const chaveHistorico = "historicoFechamento-" + dataHoje;
  const historicoDoDia = JSON.parse(localStorage.getItem(chaveHistorico) || "[]");

  historicoDoDia.push(novoPedido);
  localStorage.setItem(chaveHistorico, JSON.stringify(historicoDoDia));

  alert("Comanda fechada e registrada no histórico!");
  fecharModal();
  removerComanda();

  window.location.href = "../Histórico/histórico.html";
}



function removerComanda() {
  comandas = comandas.filter(c => c.id !== comandaSelecionada.id);
  salvar();
  listarComandas();
  document.getElementById("detalhesComanda").style.display = "none";
  comandaSelecionada = null;
}


// ===== Cancelar comanda =====
function cancelarComanda() {
  if (confirm("Cancelar essa comanda?")) {
    comandas = comandas.filter
    (c => c.id !== comandaSelecionada.id);
    salvar();
    listarComandas();
    document.getElementById("detalhesComanda").style.display = "none";
  }
}

// Inicializa lista ao carregar
listarComandas();
