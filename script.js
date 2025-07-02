// script.js completo para o sistema do Explosão Açaí

/* ---------- MENU HAMBÚRGUER ---------- */
document
  .getElementById('menuToggle')
  ?.addEventListener('click', () =>
    document.getElementById('sidebar').classList.toggle('active')
  );

/* ---------- VARIÁVEIS / LOCALSTORAGE ---------- */
let pedidoId   = +localStorage.getItem('pedidoId')   || 1;
const comandas = JSON.parse(localStorage.getItem('comandas') || '{}');

let caixaAberto   = localStorage.getItem('caixaAberto') === 'true';
let valorAbertura = +localStorage.getItem('valorAbertura') || 0;
let totalPedidos  = +localStorage.getItem('totalPedidos')  || 0;

/* ---------- FUNÇÃO DE PERSISTÊNCIA ---------- */
function salvarDados() {
  localStorage.setItem('pedidoId',      pedidoId.toString());
  localStorage.setItem('comandas',      JSON.stringify(comandas));
  localStorage.setItem('totalPedidos',  totalPedidos.toString());
  localStorage.setItem('valorAbertura', valorAbertura.toString());
  localStorage.setItem('caixaAberto',   caixaAberto.toString());
}

/* ---------- MOSTRAR CAMPOS DINÂMICOS ---------- */
document.getElementById('pagamento')?.addEventListener('change', function () {
  const forma                   = this.value;
  const trocoCtn                = document.getElementById('trocoContainer');
  const valorEntregueCtn        = document.getElementById('valorEntregueContainer');
  const tipoCartaoCtn           = document.getElementById('tipoCartaoContainer');
  const resetMoneyFields = () => {
    document.getElementById('desejaTroco').value  = '';
    document.getElementById('valorEntregue').value = '';
    valorEntregueCtn.style.display = 'none';
  };

  if (forma === 'Dinheiro') {
    trocoCtn.style.display       = 'block';
    tipoCartaoCtn.style.display  = 'none';
    document.getElementById('tipoCartao').value = '';
  } else if (forma === 'Cartão') {
    trocoCtn.style.display       = 'none';
    resetMoneyFields();
    tipoCartaoCtn.style.display  = 'block';
  } else { /* Pix */
    trocoCtn.style.display       = 'none';
    tipoCartaoCtn.style.display  = 'none';
    document.getElementById('tipoCartao').value = '';
    resetMoneyFields();
  }
});

function verificarTroco() {
  const deseja                   = document.getElementById('desejaTroco').value;
  const valorEntregueCtn         = document.getElementById('valorEntregueContainer');
  valorEntregueCtn.style.display = deseja === 'sim' ? 'block' : 'none';
  if (deseja !== 'sim') document.getElementById('valorEntregue').value = '';
}

document.getElementById('desejaTroco')?.addEventListener('change', verificarTroco);

document.getElementById('tipoPedido')?.addEventListener('change', function () {
  const tipo = this.value;
  document.getElementById('campoAcai').style.display = (tipo === 'acai' || tipo === 'ambos') ? 'block' : 'none';
  document.getElementById('campoProduto').style.display = (tipo === 'produto' || tipo === 'ambos') ? 'block' : 'none';
});

/* ---------- CÁLCULO TOTAL ---------- */
window.calcularTotal = function () {
  const tipo = document.getElementById('tipoPedido').value;
  const valorAcai = parseFloat(document.getElementById('valorAcai').value) || 0;
  const valorProduto = parseFloat(document.getElementById('valorProduto').value) || 0;
  const pagamento = document.getElementById('pagamento').value;
  const vendedor = document.getElementById('vendedores').value;
  const descricao = document.getElementById('descricao').value;
  const tipoCartao = document.getElementById('tipoCartao').value;
  const desejaTroco = document.getElementById('desejaTroco').value;
  const valorEntregue = parseFloat(document.getElementById('valorEntregue').value) || 0;

  if (!tipo || !pagamento || !vendedor) {
    document.getElementById('resumo').textContent = 'Preencha todos os campos obrigatórios.';
    return;
  }

  let total = 0;
  let resumo = '';

  if (tipo === 'acai' || tipo === 'ambos') {
    if (valorAcai <= 0) {
      document.getElementById('resumo').textContent = 'Valor de Açaí inválido.';
      return;
    }
    total += valorAcai;
    resumo += `<strong>Açaí:</strong> R$ ${valorAcai.toFixed(2)}<br>`;
  }

  if (tipo === 'produto' || tipo === 'ambos') {
    if (valorProduto <= 0) {
      document.getElementById('resumo').textContent = 'Valor de Produto inválido.';
      return;
    }
    total += valorProduto;
    resumo += `<strong>Produto:</strong> R$ ${valorProduto.toFixed(2)}<br>`;
  }

  if (pagamento === 'Cartão') {
    if (!tipoCartao) {
      document.getElementById('resumo').textContent = 'Selecione o tipo de cartão.';
      return;
    }
    resumo += `<strong>Pagamento:</strong> Cartão (${tipoCartao})<br>`;
  } else if (pagamento === 'Dinheiro') {
    resumo += `<strong>Pagamento:</strong> Dinheiro<br>`;
    if (desejaTroco === 'sim') {
      if (valorEntregue < total) {
        document.getElementById('resumo').textContent = 'Valor entregue insuficiente.';
        return;
      }
      const troco = valorEntregue - total;
      resumo += `<strong>Valor Entregue:</strong> R$ ${valorEntregue.toFixed(2)}<br>`;
      resumo += `<strong>Troco:</strong> R$ ${troco.toFixed(2)}<br>`;
    }
  } else {
    resumo += `<strong>Pagamento:</strong> ${pagamento}<br>`;
  }

  if (descricao) {
    resumo += `<strong>Descrição:</strong> ${descricao}<br>`;
  }

  resumo += `<strong>Total:</strong> <span style="font-size:1.2rem">R$ ${total.toFixed(2)}</span>`;

  document.getElementById('resumo').innerHTML = resumo;
};

/* ---------- IMPRESSÃO ---------- */
window.imprimirComanda = function () {
  const texto = document.getElementById('resumo').innerHTML;
  const win = window.open('', '', 'width=400,height=600');
  win.document.write(`<div style="font-family:monospace; font-size:16px;">${texto}</div><script>window.print();<\/script>`);
  win.document.close();
};
