function carregarHistorico() {
  const historico = document.getElementById("historicoPedidos");
  const btnLimpar = document.getElementById("btnLimpar");
  historico.innerHTML = "";

  const chaves = Object.keys(localStorage).filter((k) =>
    k.startsWith("historicoFechamento-")
  );

  if (chaves.length === 0) {
    historico.innerHTML = "<li>Nenhum fechamento encontrado.</li>";
    btnLimpar.disabled = true;
    return;
  }

  btnLimpar.disabled = false;

  // Ordena pela data do mais recente para o mais antigo
  chaves.sort(
    (a, b) =>
      new Date(b.replace("historicoFechamento-", "")) -
      new Date(a.replace("historicoFechamento-", ""))
  );

  chaves.forEach((chave) => {
    const data = chave.replace("historicoFechamento-", "");
    const pedidos = Object.values(JSON.parse(localStorage.getItem(chave)));

    // Título com data
    const titulo = document.createElement("li");
    titulo.textContent = `📅 Fechamento de ${data}`;
    titulo.style.fontWeight = "bold";
    titulo.style.backgroundColor = "#37004d";
    titulo.style.textAlign = "center";
    historico.appendChild(titulo);

    pedidos.sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));

    pedidos.forEach((pedido) => {
      if (
        !pedido ||
        !pedido.id ||
        !pedido.vendedor ||
        !pedido.total ||
        !pedido.dataHora
      )
        return;

      const item = document.createElement("li");
      item.textContent =
        `Pedido #${pedido.id}\n` +
        `Vendedor: ${pedido.vendedor}\n` +
        `Total: R$ ${pedido.total}\n` +
        `Pagamento(s):\n${pedido.pagamentos
          .map((p) => {
            if (p.forma === "Dinheiro" && p.desejaTroco === "sim") {
              const troco = (p.valorEntregue - p.valor).toFixed(2);
              return `- ${p.forma}: R$ ${p.valor.toFixed(
                2
              )} (Entregue: R$ ${p.valorEntregue.toFixed(
                2
              )}, Troco: R$ ${troco})`;
            } else if (p.forma === "Cartão") {
              return `- ${p.forma} (${p.tipoCartao}): R$ ${p.valor.toFixed(2)}`;
            } else {
              return `- ${p.forma}: R$ ${p.valor.toFixed(2)}`;
            }
          })
          .join("\n")}\n` +
        `Descrição: ${pedido.descricao}\n` +
        `Data/Hora: ${pedido.dataHora}`;
      historico.appendChild(item);
    });
  });
}

function limparHistorico() {
  if (
    confirm(
      "Tem certeza que deseja limpar todo o histórico de fechamentos? Essa ação não pode ser desfeita."
    )
  ) {
    const chaves = Object.keys(localStorage).filter((k) =>
      k.startsWith("historicoFechamento-")
    );
    chaves.forEach((k) => localStorage.removeItem(k));
    carregarHistorico();
    alert("Histórico limpo com sucesso!");
  }
}
