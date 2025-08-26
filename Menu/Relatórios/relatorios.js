const relatorios = JSON.parse(
        localStorage.getItem("historicoFechamentos") || "[]"
      );
      const container = document.getElementById("relatorios");

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
            div.textContent = `Fechamento ${relatorios.length - index}
----------------------------
Data/Hora:       ${item.dataHora}
Abertura:        R$ ${item.abertura}
Vendas:          R$ ${item.vendas}
Comp. 1:         R$ ${item.comp1}
Comp. 2:         R$ ${item.comp2}
iFood:           R$ ${item.ifood}
AiPede:          R$ ${item.aipede}

Recebido:
  Dinheiro:      R$ ${item.dinheiro}
  Pix:           R$ ${item.pix}
  Cartão:        R$ ${item.cartao}

Total Final:     R$ ${item.totalFinal}
Lucro:           R$ ${item.lucro}
----------------------------`;
            container.appendChild(div);
          });
      }

      carregarRelatorios();