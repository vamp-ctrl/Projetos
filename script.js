// ==================== Estado inicial ====================
let pedidoId = +localStorage.getItem("pedidoId") || 1;
let comandas = JSON.parse(localStorage.getItem("comandas") || "{}");

let caixaAberto = localStorage.getItem("caixaAberto") === "true";
let valorAbertura = +localStorage.getItem("valorAbertura") || 0;
let totalPedidos = +localStorage.getItem("totalPedidos") || 0;

// ==================== Utilitários ====================
function salvarDados() {
  localStorage.setItem("pedidoId", pedidoId.toString());
  localStorage.setItem("comandas", JSON.stringify(comandas));
  localStorage.setItem("totalPedidos", totalPedidos.toString());
  localStorage.setItem("valorAbertura", valorAbertura.toString());
  localStorage.setItem("caixaAberto", caixaAberto.toString());
}

function calcularTotais() {
  let valorAcai = [...document.querySelectorAll(".valorAcai")]
    .reduce((s, i) => s + (+i.value || 0), 0);
  let valorProduto = [...document.querySelectorAll(".valorProduto")]
    .reduce((s, i) => s + (+i.value || 0), 0);
  return { valorAcai, valorProduto, total: valorAcai + valorProduto };
}

function exibirMensagem(mensagem, cor = "black") {
  const resumo = document.getElementById("resumo");
  resumo.innerHTML = `<span style="color:${cor};">${mensagem}</span>`;
}

// ==================== Inicialização ====================
window.onload = function () {
  const params = new URLSearchParams(window.location.search);
  const comandaId = params.get("comandaId");
  if (comandaId) {
    const comandasAbertas = JSON.parse(localStorage.getItem("comandasAbertas") || "[]");
    const comanda = comandasAbertas.find(c => c.id == comandaId);
    if (comanda) {
      document.getElementById("vendedorInput").value = "";

      const totalAcai = comanda.itens
        .filter(i => i.tipo.toLowerCase() === "açaí")
        .reduce((s, v) => s + v.valor, 0);
      const totalProduto = comanda.itens
        .filter(i => i.tipo.toLowerCase() === "produto")
        .reduce((s, v) => s + v.valor, 0);

      if (totalAcai > 0) {
        document.getElementById("tipoPedido").value = "acai";
        document.getElementById("acaiContainer").style.display = "block";
      }
      if (totalProduto > 0) {
        document.getElementById("tipoPedido").value = totalAcai > 0 ? "ambos" : "produto";
        document.getElementById("produtoContainer").style.display = "block";
      }

      // Preenche valores iniciais
      adicionarItem("acai", totalAcai);
      adicionarItem("produto", totalProduto);

      localStorage.setItem("comandaFechada", JSON.stringify(comanda));
    }
  }
};

// ==================== Funções principais ====================
function adicionarItem(tipo, valor = "") {
  const container = document.getElementById(
    tipo === "acai" ? "listaAcai" : "listaProduto"
  );
  const div = document.createElement("div");
  div.classList.add("itemPedido");

  div.innerHTML = `
    <input type="number" class="valor${tipo[0].toUpperCase() + tipo.slice(1)}"
           step="0.01" min="0" max="10000"
           placeholder="Valor do ${tipo} (R$)" value="${valor}">
    <button type="button" class="removerItem">Remover</button>
  `;

  div.querySelector(".removerItem").addEventListener("click", () => div.remove());
  container.appendChild(div);
}

function adicionarPagamento() {
  const container = document.getElementById("pagamentosContainer");
  const addButton = document.getElementById("btnAdicionarPagamento");
  if (container.querySelectorAll(".pagamentoItem").length >= 3) return;

  const { total } = calcularTotais();

  const div = document.createElement("div");
  div.classList.add("pagamentoItem");
  div.innerHTML = `
    <select class="formaPagamento">
      <option value="" disabled selected hidden>Forma</option>
      <option value="Dinheiro">Dinheiro</option>
      <option value="Pix">Pix</option>
      <option value="Cartão">Cartão</option>
    </select>

    <input type="number" class="valorPagamento" step="0.01" min="0" max="10000"
           placeholder="Valor (R$)" value="${total.toFixed(2)}">

    <select class="tipoCartao" style="display:none">
      <option value="" disabled selected hidden>Tipo</option>
      <option value="Crédito">Crédito</option>
      <option value="Débito">Débito</option>
    </select>

    <div class="trocoContainer" style="display:none; margin-top:4px;">
      <label>Deseja troco?</label>
      <select class="desejaTroco">
        <option value="" disabled selected hidden>Selecione</option>
        <option value="sim">Sim</option>
        <option value="nao">Não</option>
      </select>
    </div>

    <div class="valorEntregueContainer" style="display:none; margin-top:4px;">
      <label>Valor entregue pelo cliente (R$):</label>
      <input type="number" class="valorEntregue" step="0.01" min="0" max="10000"/>
    </div>

    <button type="button" class="removerPagamento">Remover</button>
  `;

  const formaPagamentoSelect = div.querySelector(".formaPagamento");
  const tipoCartaoSelect = div.querySelector(".tipoCartao");
  const trocoContainer = div.querySelector(".trocoContainer");
  const desejaTrocoSelect = div.querySelector(".desejaTroco");
  const valorEntregueContainer = div.querySelector(".valorEntregueContainer");
  const valorEntregueInput = div.querySelector(".valorEntregue");

  formaPagamentoSelect.addEventListener("change", function () {
    tipoCartaoSelect.style.display = this.value === "Cartão" ? "inline-block" : "none";
    trocoContainer.style.display = this.value === "Dinheiro" ? "block" : "none";
    if (this.value !== "Dinheiro") valorEntregueContainer.style.display = "none";
    desejaTrocoSelect.value = "";
    valorEntregueInput.value = "";
  });

  desejaTrocoSelect.addEventListener("change", function () {
    valorEntregueContainer.style.display = this.value === "sim" ? "block" : "none";
    if (this.value !== "sim") valorEntregueInput.value = "";
  });

  div.querySelector(".removerPagamento").addEventListener("click", () => {
    div.remove();
    addButton.disabled = false;
  });

  container.appendChild(div);
  if (container.querySelectorAll(".pagamentoItem").length >= 3) {
    addButton.disabled = true;
  }
}

// ==================== Calcular e lançar pedido ====================
window.calcularTotal = function () {
  if (!caixaAberto) {
    exibirMensagem("O caixa está fechado.", "red");
    document.getElementById("comanda").style.display = "none";
    document.getElementById("imprimirComanda").style.display = "none";
    return;
  }

  const tipo = document.getElementById("tipoPedido").value;
  const { valorAcai, valorProduto, total } = calcularTotais();
  const vendedor = document.getElementById("vendedorInput").value.trim();
  const descricao = document.getElementById("descricao").value;

  if (!tipo || !vendedor) {
    exibirMensagem("Preencha todos os campos obrigatórios.", "red");
    return;
  }

  const pagamentoItens = document.querySelectorAll(".pagamentoItem");
  if (pagamentoItens.length === 0) {
    exibirMensagem("Adicione ao menos uma forma de pagamento.", "red");
    return;
  }

  let valorPagoTotal = 0, pagamentoResumo = "", trocoTotal = 0;

  for (const item of pagamentoItens) {
    const forma = item.querySelector(".formaPagamento").value;
    const valor = +(item.querySelector(".valorPagamento").value) || 0;
    const tipoCartao = item.querySelector(".tipoCartao").value;
    const desejaTroco = item.querySelector(".desejaTroco")?.value || "nao";
    const valorEntregue = +(item.querySelector(".valorEntregue")?.value) || 0;

    if (!forma || valor <= 0) {
      exibirMensagem("Preencha corretamente todas as formas de pagamento.", "red");
      return;
    }
    if (forma === "Cartão" && !tipoCartao) {
      exibirMensagem("Selecione o tipo de cartão em todos os pagamentos de cartão.", "red");
      return;
    }
    if (forma === "Dinheiro" && desejaTroco === "sim") {
      if (valorEntregue < valor) {
        exibirMensagem("Valor entregue insuficiente para o pagamento em dinheiro.", "red");
        return;
      }
      trocoTotal += valorEntregue - valor;
      pagamentoResumo += `${forma}: R$ ${valor.toFixed(2)} (Entregue: R$ ${valorEntregue.toFixed(2)}, Troco: R$ ${(valorEntregue - valor).toFixed(2)})<br>`;
    } else if (forma === "Cartão") {
      pagamentoResumo += `${forma} (${tipoCartao}): R$ ${valor.toFixed(2)}<br>`;
    } else {
      pagamentoResumo += `${forma}: R$ ${valor.toFixed(2)}<br>`;
    }
    valorPagoTotal += valor;
  }

  if (valorPagoTotal < total) {
    exibirMensagem(`Valor pago insuficiente. Total: R$ ${total.toFixed(2)} / Pago: R$ ${valorPagoTotal.toFixed(2)}`, "red");
    return;
  }

  // Montar resumo
  let resumo = `<strong>Vendedor:</strong> ${vendedor}<br>`;
  if (tipo === "acai" || tipo === "ambos") resumo += `<strong>Açaí:</strong> R$ ${valorAcai.toFixed(2)}<br>`;
  if (tipo === "produto" || tipo === "ambos") resumo += `<strong>Produto:</strong> R$ ${valorProduto.toFixed(2)}<br>`;
  resumo += `<strong>Pagamento(s):</strong><br>${pagamentoResumo}`;
  if (trocoTotal > 0) resumo += `<strong>Troco Total:</strong> R$ ${trocoTotal.toFixed(2)}<br>`;
  if (descricao) resumo += `<strong>Descrição:</strong> ${descricao}<br>`;
  resumo += `<strong>Total:</strong> <span style="font-size:1.2rem">R$ ${total.toFixed(2)}</span>`;

  document.getElementById("resumo").innerHTML = resumo;
  document.getElementById("comanda").innerHTML = resumo;
  document.getElementById("comanda").style.display = "block";
  document.getElementById("imprimirComanda").style.display = "inline-block";

  // Salvar pedido
  const comandaFechada = JSON.parse(localStorage.getItem("comandaFechada") || "null");
  comandas[`pedido${pedidoId}`] = {
    id: pedidoId,
    vendedor, tipo,
    acai: valorAcai.toFixed(2),
    produto: valorProduto.toFixed(2),
    pagamentos: Array.from(pagamentoItens).map((item) => ({
      forma: item.querySelector(".formaPagamento").value,
      valor: +(item.querySelector(".valorPagamento").value) || 0,
      tipoCartao: item.querySelector(".tipoCartao").value || null,
      desejaTroco: item.querySelector(".desejaTroco")?.value || "nao",
      valorEntregue: +(item.querySelector(".valorEntregue")?.value) || 0,
    })),
    total: total.toFixed(2),
    descricao,
    dataHora: new Date().toLocaleString(),
    comandaId: comandaFechada ? comandaFechada.id : null
  };

  if (comandaFechada) {
    let abertas = JSON.parse(localStorage.getItem("comandasAbertas") || "[]");
    abertas = abertas.filter(c => c.id !== comandaFechada.id);
    localStorage.setItem("comandasAbertas", JSON.stringify(abertas));
    localStorage.removeItem("comandaFechada");
  }

  totalPedidos += total;
  pedidoId++;
  salvarDados();
  limparCampos();
};

// ==================== Extras ====================
window.imprimirComanda = function () {
  const texto = document.getElementById("comanda").innerHTML;
  const win = window.open("", "", "width=400,height=600");
  win.document.write(`<div style="font-family:monospace; font-size:16px;">${texto}</div><script>window.print();<\/script>`);
  win.document.close();
};

function resetarTudo() {
  if (confirm("Tem certeza que deseja apagar todos os dados do sistema?")) {
    ["pedidoId", "comandas", "totalPedidos", "valorAbertura", "caixaAberto", "comandasAbertas", "comandaFechada"]
      .forEach(key => localStorage.removeItem(key));
    location.reload();
  }
}

function limparCampos() {
  document.getElementById("vendedorInput").value = "";
  document.getElementById("descricao").value = "";
  document.getElementById("tipoPedido").value = "";
  document.getElementById("listaAcai").innerHTML = "";
  document.getElementById("listaProduto").innerHTML = "";
  document.getElementById("pagamentosContainer").innerHTML = "";
  document.getElementById("btnAdicionarPagamento").disabled = false;
  document.getElementById("imprimirComanda").style.display = "none";
  document.getElementById("acaiContainer").style.display = "none";
  document.getElementById("produtoContainer").style.display = "none";
}

// ==================== Listeners ====================
document.getElementById("tipoPedido")?.addEventListener("change", function () {
  const tipo = this.value;
  document.getElementById("acaiContainer").style.display =
    tipo === "acai" || tipo === "ambos" ? "block" : "none";
  document.getElementById("produtoContainer").style.display =
    tipo === "produto" || tipo === "ambos" ? "block" : "none";
});

document.getElementById("btnAdicionarPagamento")?.addEventListener("click", adicionarPagamento);
document.querySelector("button[onclick='resetarTudo()']")?.addEventListener("click", resetarTudo);
