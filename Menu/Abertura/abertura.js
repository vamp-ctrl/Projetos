function validarValor() {
  const input = document.getElementById("abertura");
  const botao = document.getElementById("btnAbrir");
  const valor = parseFloat(input.value);
  botao.disabled = isNaN(valor) || valor < 0;
}

function abrirCaixa() {
  const input = document.getElementById("abertura");
  const mensagem = document.getElementById("mensagem");
  const valor = parseFloat(input.value);

  if (isNaN(valor) || valor < 0) {
    mensagem.style.color = "#ef5350";
    mensagem.textContent =
      "Por favor, insira um valor válido para abrir o caixa.";
    return;
  }

  const hoje = new Date().toISOString().split("T")[0];

  localStorage.setItem("dataAbertura", new Date().toLocaleString());
  localStorage.setItem("valorAbertura", valor.toFixed(2));
  localStorage.setItem("caixaAberto", "true");
  localStorage.setItem("totalPedidos", "0");

  localStorage.setItem("pedidoId", "1");
  localStorage.setItem("comandas", "{}");

  mensagem.style.color = "#a5d6a7";
  mensagem.textContent = `Caixa aberto com R$ ${valor.toFixed(2)}`;

  document.getElementById("btnAbrir").disabled = true;
  input.disabled = true;
}

window.onload = () => {
  const caixaAberto = localStorage.getItem("caixaAberto");
  const input = document.getElementById("abertura");
  const botao = document.getElementById("btnAbrir");
  const mensagem = document.getElementById("mensagem");

  if (caixaAberto === "true") {
    const valor = parseFloat(localStorage.getItem("valorAbertura"));

    if (!isNaN(valor)) {
      input.value = valor.toFixed(2);
      input.disabled = true;
      botao.disabled = true;
      mensagem.style.color = "#a5d6a7";
      mensagem.textContent = `Caixa já está aberto com R$ ${valor.toFixed(2)}`;
    } else {
      mensagem.style.color = "#ef5350";
      mensagem.textContent = "Erro: valor de abertura inválido.";
    }
  }
};
