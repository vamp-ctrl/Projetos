function fecharCaixa() {
  const caixaAberto = localStorage.getItem("caixaAberto");
  const valorAbertura = parseFloat(localStorage.getItem("valorAbertura")) || 0;
  const comandasObj = JSON.parse(localStorage.getItem("comandas") || "{}");
  const historicoPedidos = Object.values(comandasObj);

  const fechamentoDiv = document.getElementById("fechamento");
  const botao = document.getElementById("btnFechar");

  if (caixaAberto !== "true") {
    alert("Caixa ainda não foi aberto.");
    return;
  }

  const comp1 = parseFloat(document.getElementById("comp1").value) || 0;
  const comp2 = parseFloat(document.getElementById("comp2").value) || 0;
  const ifood = parseFloat(document.getElementById("ifood").value) || 0;
  const aipede = parseFloat(document.getElementById("aipede").value) || 0;

  if (comp1 < 0 || comp2 < 0 || ifood < 0 || aipede < 0) {
    alert("Os valores não podem ser negativos.");
    return;
  }

  let totalDinheiro = 0;
  let totalPix = 0;
  let totalCartao = 0;
  let totalVendas = 0;

  historicoPedidos.forEach((pedido) => {
    if (!pedido.pagamentos || pedido.total == null) return;

    pedido.pagamentos.forEach((p) => {
      const forma = p.forma?.toLowerCase();
      const valor = parseFloat(p.valor) || 0;

      switch (forma) {
        case "dinheiro":
          totalDinheiro += valor;
          break;
        case "pix":
          totalPix += valor;
          break;
        case "cartão":
        case "cartao":
          totalCartao += valor;
          break;
      }
    });

    totalVendas += Number(pedido.total);
  });

  const totalFinal =
    valorAbertura + totalVendas + comp1 + comp2 + ifood + aipede;
  const lucro = totalFinal - valorAbertura;

  if (totalFinal < 0) {
    alert("O total final não pode ser negativo.");
    return;
  }

  // Salvar histórico de fechamento
  const historicoFechamentos = JSON.parse(
    localStorage.getItem("historicoFechamentos") || "[]"
  );
  historicoFechamentos.push({
    dataHora: new Date().toLocaleString(),
    abertura: valorAbertura.toFixed(2),
    vendas: totalVendas.toFixed(2),
    comp1: comp1.toFixed(2),
    comp2: comp2.toFixed(2),
    ifood: ifood.toFixed(2),
    aipede: aipede.toFixed(2),
    dinheiro: totalDinheiro.toFixed(2),
    pix: totalPix.toFixed(2),
    cartao: totalCartao.toFixed(2),
    totalFinal: totalFinal.toFixed(2),
    lucro: lucro.toFixed(2),
  });
  localStorage.setItem(
    "historicoFechamentos",
    JSON.stringify(historicoFechamentos)
  );

  // Salvar histórico de pedidos por dia
  const dataHoje = new Date().toISOString().split("T")[0];
  localStorage.setItem(
    `historicoFechamento-${dataHoje}`,
    JSON.stringify(comandasObj)
  );

  // Mostrar resumo
  const fechamento = `RESUMO DO CAIXA
----------------------------
Abertura:         R$ ${valorAbertura.toFixed(2)}
Vendas:           R$ ${totalVendas.toFixed(2)}
Comp. 1:          R$ ${comp1.toFixed(2)}
Comp. 2:          R$ ${comp2.toFixed(2)}
iFood:            R$ ${ifood.toFixed(2)}
AiPede:           R$ ${aipede.toFixed(2)}
----------------------------
Recebido por forma de pagamento:
  Dinheiro:       R$ ${totalDinheiro.toFixed(2)}
  Pix:            R$ ${totalPix.toFixed(2)}
  Cartão:         R$ ${totalCartao.toFixed(2)}
----------------------------
Lucro:            R$ ${lucro.toFixed(2)}
Total Final:      R$ ${totalFinal.toFixed(2)}
----------------------------
Fechamento em: ${new Date().toLocaleString()}`;

  fechamentoDiv.textContent = fechamento;
  fechamentoDiv.style.display = "block";
  botao.disabled = true;

  // Limpar dados temporários
  localStorage.removeItem("caixaAberto");
  localStorage.removeItem("valorAbertura");
  localStorage.removeItem("totalPedidos");
  localStorage.removeItem("comandas");
  localStorage.removeItem("pedidoId");
  localStorage.removeItem("comandasAbertas");
}

window.onload = () => {
  const caixaAberto = localStorage.getItem("caixaAberto");
  if (caixaAberto !== "true") {
    const fechamentoDiv = document.getElementById("fechamento");
    fechamentoDiv.textContent =
      "Caixa não está aberto. Abra o caixa antes de fechar.";
    fechamentoDiv.style.display = "block";
    document.getElementById("btnFechar").disabled = true;
  }
};
