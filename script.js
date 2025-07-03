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

function adicionarPagamento() {
  const container = document.getElementById('pagamentosContainer');
  const addButton = document.getElementById('btnAdicionarPagamento');
  const totalPagamentos = container.querySelectorAll('.pagamentoItem').length;

  if (totalPagamentos >= 3) return;

  const div = document.createElement('div');
  div.classList.add('pagamentoItem');

  div.innerHTML = `
    <select class="formaPagamento">
      <option value="" disabled selected hidden>Forma</option>
      <option value="Dinheiro">Dinheiro</option>
      <option value="Pix">Pix</option>
      <option value="Cartão">Cartão</option>
    </select>

    <input type="number" class="valorPagamento" step="0.01" placeholder="Valor (R$)">

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
      <input type="number" class="valorEntregue" step="0.01" />
    </div>

    <button type="button" class="removerPagamento">Remover</button>
  `;

  container.appendChild(div);

  const formaPagamentoSelect = div.querySelector('.formaPagamento');
  const tipoCartaoSelect = div.querySelector('.tipoCartao');
  const trocoContainer = div.querySelector('.trocoContainer');
  const desejaTrocoSelect = div.querySelector('.desejaTroco');
  const valorEntregueContainer = div.querySelector('.valorEntregueContainer');
  const valorEntregueInput = div.querySelector('.valorEntregue');

  // Mostrar/ocultar campos conforme forma de pagamento
  formaPagamentoSelect.addEventListener('change', function () {
    if (this.value === 'Cartão') {
      tipoCartaoSelect.style.display = 'inline-block';
      trocoContainer.style.display = 'none';
      valorEntregueContainer.style.display = 'none';
      desejaTrocoSelect.value = '';
      valorEntregueInput.value = '';
    } else if (this.value === 'Dinheiro') {
      tipoCartaoSelect.style.display = 'none';
      trocoContainer.style.display = 'block';
      valorEntregueContainer.style.display = 'none';
      desejaTrocoSelect.value = '';
      valorEntregueInput.value = '';
    } else {
      tipoCartaoSelect.style.display = 'none';
      trocoContainer.style.display = 'none';
      valorEntregueContainer.style.display = 'none';
      desejaTrocoSelect.value = '';
      valorEntregueInput.value = '';
    }
  });

  // Mostrar campo valor entregue se desejar troco = sim
  desejaTrocoSelect.addEventListener('change', function () {
    if (this.value === 'sim') {
      valorEntregueContainer.style.display = 'block';
    } else {
      valorEntregueContainer.style.display = 'none';
      valorEntregueInput.value = '';
    }
  });

  // Remover pagamento e reativar botão se necessário
  div.querySelector('.removerPagamento').addEventListener('click', function () {
    div.remove();
    if (container.querySelectorAll('.pagamentoItem').length < 3) {
      addButton.disabled = false;
    }
  });

  // Desativa o botão se chegou no máximo
  if (container.querySelectorAll('.pagamentoItem').length >= 3) {
    addButton.disabled = true;
  }
}




/* ---------- MOSTRAR CAMPOS DINÂMICOS ---------- */
document.getElementById('pagamento')?.addEventListener('change', function () {
  const forma = this.value;
  const trocoCtn = document.getElementById('trocoContainer');
  const valorEntregueCtn = document.getElementById('valorEntregueContainer');
  const tipoCartaoCtn = document.getElementById('tipoCartaoContainer');
  const resetMoneyFields = () => {
    document.getElementById('desejaTroco').value = '';
    document.getElementById('valorEntregue').value = '';
    valorEntregueCtn.style.display = 'none';
  };

  if (forma === 'Dinheiro') {
    trocoCtn.style.display = 'block';
    tipoCartaoCtn.style.display = 'none';
    document.getElementById('tipoCartao').value = '';
  } else if (forma === 'Cartão') {
    trocoCtn.style.display = 'none';
    resetMoneyFields();
    tipoCartaoCtn.style.display = 'block';
  } else { // Pix
    trocoCtn.style.display = 'none';
    tipoCartaoCtn.style.display = 'none';
    document.getElementById('tipoCartao').value = '';
    resetMoneyFields();
  }
});

function verificarTroco() {
  const deseja = document.getElementById('desejaTroco').value;
  const valorEntregueCtn = document.getElementById('valorEntregueContainer');
  valorEntregueCtn.style.display = deseja === 'sim' ? 'block' : 'none';
  if (deseja !== 'sim') document.getElementById('valorEntregue').value = '';
}

document.getElementById('desejaTroco')?.addEventListener('change', verificarTroco);

document.getElementById('tipoPedido')?.addEventListener('change', function () {
  const tipo = this.value;
  document.getElementById('campoAcai').style.display = (tipo === 'acai' || tipo === 'ambos') ? 'block' : 'none';
  document.getElementById('campoProduto').style.display = (tipo === 'produto' || tipo === 'ambos') ? 'block' : 'none';
});

/* ---------- CÁLCULO TOTAL + COMANDA ---------- */
window.calcularTotal = function () {
  if (!caixaAberto) {
    document.getElementById('resumo').innerHTML = '<span style="color:red;">O caixa está fechado.</span>';
    document.getElementById('comanda').style.display = 'none';
    document.getElementById('imprimirComanda').style.display = 'none';
    return;
  }

  const tipo = document.getElementById('tipoPedido').value;
  const valorAcai = parseFloat(document.getElementById('valorAcai').value) || 0;
  const valorProduto = parseFloat(document.getElementById('valorProduto').value) || 0;
  const vendedor = document.getElementById('vendedorInput').value.trim();
  const descricao = document.getElementById('descricao').value;

  const pagamentoItens = document.querySelectorAll('.pagamentoItem');
  let valorPagoTotal = 0;
  let pagamentoResumo = '';
  let trocoTotal = 0;

  if (!tipo || !vendedor) {
    document.getElementById('resumo').textContent = 'Preencha todos os campos obrigatórios.';
    return;
  }

  if (pagamentoItens.length === 0) {
    document.getElementById('resumo').textContent = 'Adicione ao menos uma forma de pagamento.';
    return;
  }

  for (const item of pagamentoItens) {
    const forma = item.querySelector('.formaPagamento').value;
    const valor = parseFloat(item.querySelector('.valorPagamento').value) || 0;
    const tipoCartao = item.querySelector('.tipoCartao').value;
    const desejaTroco = item.querySelector('.desejaTroco')?.value || 'nao';
    const valorEntregue = parseFloat(item.querySelector('.valorEntregue')?.value) || 0;

    if (!forma || valor <= 0) {
      document.getElementById('resumo').textContent = 'Preencha corretamente todas as formas de pagamento.';
      return;
    }

    if (forma === 'Cartão' && !tipoCartao) {
      document.getElementById('resumo').textContent = 'Selecione o tipo de cartão em todos os pagamentos de cartão.';
      return;
    }

    if (forma === 'Dinheiro' && desejaTroco === 'sim') {
      if (valorEntregue < valor) {
        document.getElementById('resumo').textContent = 'Valor entregue insuficiente para o pagamento em dinheiro.';
        return;
      }
      trocoTotal += (valorEntregue - valor);
      pagamentoResumo += `${forma}: R$ ${valor.toFixed(2)} (Valor entregue: R$ ${valorEntregue.toFixed(2)}, Troco: R$ ${(valorEntregue - valor).toFixed(2)})<br>`;
    } else if (forma === 'Cartão') {
      pagamentoResumo += `${forma} (${tipoCartao}): R$ ${valor.toFixed(2)}<br>`;
    } else {
      pagamentoResumo += `${forma}: R$ ${valor.toFixed(2)}<br>`;
    }

    valorPagoTotal += valor;
  }

  let total = 0;

  if (tipo === 'acai' || tipo === 'ambos') {
    if (valorAcai <= 0) {
      document.getElementById('resumo').textContent = 'Valor de Açaí inválido.';
      return;
    }
    total += valorAcai;
  }

  if (tipo === 'produto' || tipo === 'ambos') {
    if (valorProduto <= 0) {
      document.getElementById('resumo').textContent = 'Valor de Produto inválido.';
      return;
    }
    total += valorProduto;
  }

  if (valorPagoTotal < total) {
    document.getElementById('resumo').innerHTML = `<span style="color:red;">Valor pago insuficiente. Total: R$ ${total.toFixed(2)} / Pago: R$ ${valorPagoTotal.toFixed(2)}</span>`;
    return;
  }

  let resumo = `<strong>Vendedor:</strong> ${vendedor}<br>`;
  if (tipo === 'acai' || tipo === 'ambos') resumo += `<strong>Açaí:</strong> R$ ${valorAcai.toFixed(2)}<br>`;

  if (tipo === 'produto' || tipo === 'ambos') resumo += `<strong>Produto:</strong> R$ ${valorProduto.toFixed(2)}<br>`;
  resumo += `<strong>Pagamento(s):</strong><br>${pagamentoResumo}`;

  if (trocoTotal > 0) {
    resumo += `<strong>Troco Total:</strong> R$ ${trocoTotal.toFixed(2)}<br>`;
  }

  if (descricao) {
    resumo += `<strong>Descrição:</strong> ${descricao}<br>`;
  }

  resumo += `<strong>Total:</strong> <span style="font-size:1.2rem">R$ ${total.toFixed(2)}</span>`;

  document.getElementById('resumo').innerHTML = resumo;
  document.getElementById('comanda').innerHTML = resumo;
  document.getElementById('comanda').style.display = 'block';
  document.getElementById('imprimirComanda').style.display = 'inline-block';

  // Salvar o pedido com array de pagamentos detalhados
  comandas[`pedido${pedidoId}`] = {
    id: pedidoId,
    vendedor: vendedor,
    tipo: tipo,
    acai: valorAcai.toFixed(2),
    produto: valorProduto.toFixed(2),
    pagamentos: Array.from(pagamentoItens).map(item => ({
      forma: item.querySelector('.formaPagamento').value,
      valor: parseFloat(item.querySelector('.valorPagamento').value) || 0,
      tipoCartao: item.querySelector('.tipoCartao').value || null,
      desejaTroco: item.querySelector('.desejaTroco')?.value || 'nao',
      valorEntregue: parseFloat(item.querySelector('.valorEntregue')?.value) || 0
    })),
    total: total.toFixed(2),
    descricao: descricao,
    dataHora: new Date().toLocaleString()
  };

  totalPedidos += total;
  pedidoId++;
  salvarDados();
};



/* ---------- IMPRESSÃO ---------- */
window.imprimirComanda = function () {
  const texto = document.getElementById('comanda').innerHTML;
  const win = window.open('', '', 'width=400,height=600');
  win.document.write(`<div style="font-family:monospace; font-size:16px;">${texto}</div><script>window.print();<\/script>`);
  win.document.close();
};
