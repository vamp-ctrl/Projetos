const relatorios = JSON.parse(
  localStorage.getItem("historicoFechamentos") || "[]"
);
const container = document.getElementById("relatorios");

function formatarValor(valor) {
  return valor !== undefined && valor !== null ? valor.toFixed(2) : "0.00";
}

function carregarRelatorios() {
  container.innerHTML = "";

  if (relatorios.length === 0) {
    container.textContent =
      "Nenhum fechamento registrado.\n\nUse o menu para registrar um.";
    return;
  }

  relatorios
    .slice()
    .reverse()
    .forEach((item, index) => {
      const div = document.createElement("div");
      div.className = "relatorio";

      div.textContent = 
`Fechamento ${relatorios.length - index}
----------------------------
Data/Hora:       ${item.dataHora || "-"}
Abertura:        R$ ${formatarValor(item.abertura)}
Vendas:          R$ ${formatarValor(item.vendas)}
Comp. 1:         R$ ${formatarValor(item.comp1)}
Comp. 2:         R$ ${formatarValor(item.comp2)}
iFood:           R$ ${formatarValor(item.ifood)}
AiPede:          R$ ${formatarValor(item.aipede)}

Recebido:
  Dinheiro:      R$ ${formatarValor(item.dinheiro)}
  Pix:           R$ ${formatarValor(item.pix)}
  Cartão:        R$ ${formatarValor(item.cartao)}

Total Final:     R$ ${formatarValor(item.totalFinal)}
Lucro:           R$ ${formatarValor(item.lucro)}
----------------------------`;

      container.appendChild(div);
    });
}

carregarRelatorios();
