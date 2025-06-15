// document.getElementById('menuToggle').addEventListener('click', function () {
//     document.getElementById('sidebar').classList.toggle('active');
//   });
  
//   // Carrega dados do localStorage ao iniciar
//   let pedidoId = localStorage.getItem('pedidoId') ? parseInt(localStorage.getItem('pedidoId')) : 1;
//   const comandas = localStorage.getItem('comandas') ? JSON.parse(localStorage.getItem('comandas')) : {};
//   let caixaAberto = false;
//   let valorAbertura = 0;
//   let totalPedidos = 0;
  
//   // Verifica se o caixa está aberto no localStorage
//   if (localStorage.getItem('caixaAberto') === 'true') {
//     caixaAberto = true;
//     valorAbertura = parseFloat(localStorage.getItem('valorAbertura') || '0');
//     totalPedidos = parseFloat(localStorage.getItem('totalPedidos') || '0');
//   }
  
  
//   function salvarDados() {
//     localStorage.setItem('pedidoId', pedidoId.toString());
//     localStorage.setItem('comandas', JSON.stringify(comandas));
//   }
  
  
//   function calcularTotal() {
//   if (!caixaAberto) {
//     alert('Abra o caixa primeiro.');
//     return;
//   }

//   const tipo = document.getElementById('tipoPedido').value;
//   const valorProduto = parseFloat(document.getElementById('valorProduto').value);
//   const pagamento = document.getElementById('pagamento').value;
//   const vendedor = document.getElementById('vendedores').value;
//   const descricao = document.getElementById('descricao').value;
//   const hora = new Date().toLocaleString();

//   let total = 0;
//   let resumo = '';
//   let comanda = '';

//   if (!vendedor || !pagamento || !tipo) {
//     document.getElementById('resumo').textContent = 'Preencha todos os campos obrigatórios.';
//     document.getElementById('comanda').style.display = 'none';
//     return;
//   }

//   if (tipo === 'acai' || tipo === 'ambos') {
//   const valorAcai = parseFloat(document.getElementById('valorAcai').value);
//   if (isNaN(valorAcai) || valorAcai <= 0) {
//     document.getElementById('resumo').textContent = 'Valor inválido para o Açaí.';
//     document.getElementById('comanda').style.display = 'none';
//     return;
//   }
//   total += valorAcai;
//   resumo += `<strong>Açaí:</strong> R$ ${valorAcai.toFixed(2)}<br>`;
//   comanda += `Açaí:        R$ ${valorAcai.toFixed(2)}\n`;
// }


//   if (tipo === 'produto' || tipo === 'ambos') {
//     if (isNaN(valorProduto) || valorProduto <= 0) {
//       document.getElementById('resumo').textContent = 'Valor inválido para o Produto.';
//       document.getElementById('comanda').style.display = 'none';
//       return;
//     }
//     total += valorProduto;
//     resumo += `<strong>Produto:</strong> R$ ${valorProduto.toFixed(2)}<br>`;
//     comanda += `Produto:      R$ ${valorProduto.toFixed(2)}\n`;
//   }

//   totalPedidos += total;

//   let trocoTexto = 'Não';
//   let valorEntregueTexto = '-';

//   if (pagamento === 'Dinheiro') {
//     const desejaTroco = document.getElementById('desejaTroco').value;

//     if (desejaTroco === 'sim') {
//       const valorEntregue = parseFloat(document.getElementById('valorEntregue').value);
//       if (isNaN(valorEntregue) || valorEntregue < total) {
//         document.getElementById('resumo').textContent = 'Valor entregue inválido ou menor que o total.';
//         document.getElementById('comanda').style.display = 'none';
//         return;
//       }
//       const troco = valorEntregue - total;
//       trocoTexto = `R$ ${troco.toFixed(2)}`;
//       valorEntregueTexto = `R$ ${valorEntregue.toFixed(2)}`;
//     }
//   }


//   // Exibir resumo
//   document.getElementById('resumo').innerHTML = `
//     <strong>Pedido ID:</strong> ${pedidoId}<br>
//     <strong>Vendedor:</strong>  ${vendedor}<br>

//     ${resumo}<strong>Pagamento:</strong> ${pagamento}<br>
//     <strong>Troco:</strong> (${valorEntregueTexto}) ${trocoTexto}<br>
//     <strong>Total:</strong> <span style="font-size:1.2rem">R$ ${total.toFixed(2)}</span>
//   `;

//   // Comanda em texto
//   const comandaTexto = `
// EXPLOSÃO AÇAÍ
// -----------------------
// Data/Hora:   ${hora}
// Descrição:   ${descricao}
// Vendedor:    ${vendedor}
// Pagamento:   ${pagamento}
// ${comanda}Troco:       (${valorEntregueTexto}) ${trocoTexto}
// Total:       R$ ${total.toFixed(2)}
// --------------------------
// Obrigado pela preferência!
// --------------------------
//   `;

//   document.getElementById('comanda').textContent = comandaTexto;
//   document.getElementById('comanda').style.display = 'block';
//   document.getElementById('imprimirComanda').style.display = 'inline-block';

//   // Salvar no objeto de comandas
//   comandas[pedidoId] = {
//     id: pedidoId,
//     vendedor,
//     tipo,
//     valorAcai: tipo !== 'produto' ? valorAcai.toFixed(2) : '',
//     valorProduto: tipo !== 'acai' ? valorProduto.toFixed(2) : '',
//     total: total.toFixed(2),
//     pagamento,
//     descricao,
//     dataHora: hora
//   };

//   salvarDados();
//   pedidoId++;
//   salvarDados();
// }

  
//   // Função para exibir o histórico de pedidos na página histórico.html
//   function carregarHistorico() {
//     const historico = document.getElementById('historicoPedidos');
//     if (!historico) return;
  
//     // Carrega dados do localStorage (caso a página histórico seja aberta diretamente)
//     const comandasSalvas = localStorage.getItem('comandas');
//     if (comandasSalvas) {
//       const comandasObj = JSON.parse(comandasSalvas);
//       historico.innerHTML = '';
  
//       for (const id in comandasObj) {
//         const pedido = comandasObj[id];
//         const item = document.createElement('li');
//         item.style.marginBottom = '10px';
//         item.textContent = `Pedido ${pedido.id} | R$ ${pedido.total} | ${pedido.dataHora} | ${pedido.pagamento}`;
//         historico.appendChild(item);
//       }
//     }
//   }
  
//   document.getElementById('pagamento').addEventListener('change', function () {
//   const forma = this.value;
//   const trocoContainer = document.getElementById('trocoContainer');
//   const valorEntregueContainer = document.getElementById('valorEntregueContainer');

//   if (forma === 'Dinheiro') {
//     trocoContainer.style.display = 'block';
//   } else {
//     trocoContainer.style.display = 'none';
//     valorEntregueContainer.style.display = 'none';
//     document.getElementById('desejaTroco').value = '';
//     document.getElementById('valorEntregue').value = '';
//   }
// });

// function verificarTroco() {
//   const deseja = document.getElementById('desejaTroco').value;
//   const valorEntregueContainer = document.getElementById('valorEntregueContainer');

//   if (deseja === 'sim') {
//     valorEntregueContainer.style.display = 'block';
//   } else {
//     valorEntregueContainer.style.display = 'none';
//     document.getElementById('valorEntregue').value = '';
//   }
// }

  
//   function imprimirComanda() {
//     const comanda = document.getElementById('comanda').textContent;
//     const janela = window.open('', '', 'width=400,height=600');
//     janela.document.write(`
//       <pre style="font-family:monospace; font-size:16px;">
//   ${comanda}
//       </pre>
//       <script>window.print();</script>
//     `);
//     janela.document.close();
//   }


/*  Gerenciador de Caixa – Explosão Açaí
    Versão 01-jun-2025 – melhorias:
    • exibe/valida “débito ou crédito”
    • grava tipo de cartão no resumo, comanda e localStorage
    • persiste totalPedidos, valorAbertura e caixaAberto
    • salva dados apenas 1 vez por pedido
    • limpa formulário ao final
*/

/* ---------- MENU HAMBÚRGUER ---------- */
document
  .getElementById('menuToggle')
  .addEventListener('click', () =>
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
document.getElementById('pagamento').addEventListener('change', function () {
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

/* ---------- CÁLCULO E REGISTRO DE PEDIDO ---------- */
function calcularTotal() {
  if (!caixaAberto) {
    alert('Abra o caixa primeiro.');
    return;
  }

  /* --- ENTRADAS --- */
  const tipo        = document.getElementById('tipoPedido').value;
  const valorProduto = Number(document.getElementById('valorProduto').value);
  const pagamento   = document.getElementById('pagamento').value;
  const vendedor    = document.getElementById('vendedores').value;
  const descricao   = document.getElementById('descricao').value;
  const hora        = new Date().toLocaleString();

  let total   = 0;
  let resumo  = '';
  let comanda = '';

  if (!vendedor || !pagamento || !tipo) {
    document.getElementById('resumo').textContent =
      'Preencha todos os campos obrigatórios.';
    document.getElementById('comanda').style.display = 'none';
    return;
  }

  /* --- AÇAÍ --- */
  let valorAcai = 0;
  if (tipo === 'acai' || tipo === 'ambos') {
    valorAcai = +document.getElementById('valorAcai').value;
    if (valorAcai <= 0) {
      document.getElementById('resumo').textContent =
        'Valor inválido para o Açaí.';
      document.getElementById('comanda').style.display = 'none';
      return;
    }
    total += valorAcai;
    resumo  += `<strong>Açaí:</strong> R$ ${valorAcai.toFixed(2)}<br>`;
    comanda += `\nAçaí:           R$ ${valorAcai.toFixed(2)}\n`;
  }

  /* --- PRODUTO --- */
  if (tipo === 'produto' || tipo === 'ambos') {
    if (valorProduto <= 0) {
      document.getElementById('resumo').textContent =
        'Valor inválido para o Produto.';
      document.getElementById('comanda').style.display = 'none';
      return;
    }
    total += valorProduto;
    resumo  += `<strong>Produto:</strong> R$ ${valorProduto.toFixed(2)}<br>`;
    comanda += `Produto:         R$ ${valorProduto.toFixed(2)}`;
  }

  /* --- PAGAMENTO: DINHEIRO (TROCO) --- */
  let trocoTexto         = 'Não';
  let valorEntregueTexto = '-';

  if (pagamento === 'Dinheiro') {
    const desejaTroco = document.getElementById('desejaTroco').value;
    if (desejaTroco === 'sim') {
      const valorEntregue = +document.getElementById('valorEntregue').value;
      if (valorEntregue < total) {
        document.getElementById('resumo').textContent =
          'Valor entregue inválido ou menor que o total.';
        document.getElementById('comanda').style.display = 'none';
        return;
      }
      const troco = valorEntregue - total;
      trocoTexto         = `R$ ${troco.toFixed(2)}`;
      valorEntregueTexto = `R$ ${valorEntregue.toFixed(2)}`;
    }
  }

  /* --- PAGAMENTO: CARTÃO (CRÉDITO/DÉBITO) --- */
  let tipoCartaoTexto = '-';
  if (pagamento === 'Cartão') {
    const tipoCartao = document.getElementById('tipoCartao').value;
    if (!tipoCartao) {
      document.getElementById('resumo').textContent = 'Selecione o tipo de cartão.';
      document.getElementById('comanda').style.display = 'none';
      return;
    }
    tipoCartaoTexto = tipoCartao;
  }

  /* --- RESUMO VISUAL --- */
  totalPedidos += total;
  let pagamentoLinha = `<strong>Pagamento:</strong> ${pagamento}`;
if (pagamento === 'Cartão') {
  pagamentoLinha += ` (${tipoCartaoTexto})`;
}
pagamentoLinha += `<br>`;

let trocoLinha = '';
if (pagamento === 'Dinheiro' && document.getElementById('desejaTroco').value === 'sim') {
  trocoLinha = `<strong>Troco:</strong> (${valorEntregueTexto}) ${trocoTexto}<br>`;
}

document.getElementById('resumo').innerHTML = `
  <strong>Pedido ID:</strong> ${pedidoId}<br>
  <strong>Descrição:</strong> ${descricao}<br>
  <strong>Vendedor:</strong>  ${vendedor}<br>
  ${resumo}
  ${pagamentoLinha}
  ${trocoLinha}
  <strong>Total:</strong> <span style="font-size:1.2rem">R$ ${total.toFixed(2)}</span>
`;


let comandaPagamentoLinha = `Pagamento:     ${pagamento}`;
if (pagamento === 'Cartão') {
  comandaPagamentoLinha += ` (${tipoCartaoTexto})`;
}
let comandaTrocoLinha = '';
if (pagamento === 'Dinheiro' && document.getElementById('desejaTroco').value === 'sim') {
  comandaTrocoLinha = `\nTroco:          (${valorEntregueTexto}) ${trocoTexto}\n`;
}

const comandaTexto = `
EXPLOSÃO AÇAÍ
-----------------------
Data/Hora:      ${hora}
Descrição:      ${descricao}
Vendedor:       ${vendedor}
${comandaPagamentoLinha}${comanda}
${comandaTrocoLinha}Total:          R$ ${total.toFixed(2)}
`.trim();


  document.getElementById('comanda').textContent = comandaTexto;
  document.getElementById('comanda').style.display     = 'block';
  document.getElementById('imprimirComanda').style.display = 'inline-block';

  /* --- SALVAR OBJETO --- */
  comandas[pedidoId] = {
    id: pedidoId,
    vendedor,
    tipo,
    valorAcai:    tipo !== 'produto' ? valorAcai.toFixed(2)   : '',
    valorProduto: tipo !== 'acai'    ? valorProduto.toFixed(2): '',
    total:        total.toFixed(2),
    pagamento,
    tipoCartao:   pagamento === 'Cartão' ? tipoCartaoTexto : '',
    descricao,
    dataHora:     hora
  };

  pedidoId++;
  salvarDados();
  limparFormulario();
}

/* ---------- HISTÓRICO EM PÁGINA SEPARADA ---------- */
function carregarHistorico() {
  const historico = document.getElementById('historicoPedidos');
  if (!historico) return;

  const comandasSalvas = localStorage.getItem('comandas');
  if (comandasSalvas) {
    const comandasObj = JSON.parse(comandasSalvas);
    historico.innerHTML = '';

    for (const id in comandasObj) {
      const p = comandasObj[id];
      const li = document.createElement('li');
      li.style.marginBottom = '10px';
      li.textContent = `Pedido ${p.id} | R$ ${p.total} | ${p.dataHora} | ${p.pagamento}${p.pagamento === 'Cartão' ? ' (' + p.tipoCartao + ')' : ''}`;
      historico.appendChild(li);
    }
  }
}

/* ---------- IMPRESSÃO DE COMANDA ---------- */
function imprimirComanda() {
  const texto = document.getElementById('comanda').textContent;
  const win   = window.open('', '', 'width=400,height=600');
  win.document.write(`<pre style="font-family:monospace; font-size:16px;">${texto}</pre><script>window.print();</script>`);
  win.document.close();
}

/* ---------- LIMPAR FORMULÁRIO ---------- */
function limparFormulario() {
  [
    'vendedores','tipoPedido','valorAcai','valorProduto','pagamento',
    'tipoCartao','desejaTroco','valorEntregue','descricao'
  ].forEach(id => document.getElementById(id).value = '');

  /* esconder campos dinâmicos */
  ['campoAcai','campoProduto','tipoCartaoContainer','trocoContainer','valorEntregueContainer']
    .forEach(id => document.getElementById(id).style.display = 'none');
}
document.getElementById('desejaTroco').addEventListener('change', verificarTroco);
