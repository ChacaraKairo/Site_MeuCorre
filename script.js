// ================= JAVASCRIPT PURO =================

// 1. Atualizar o ano dinamicamente no footer (para nunca ficar desatualizado)
document.addEventListener("DOMContentLoaded", function () {
  const anoAtualSpan = document.getElementById('anoAtual');
  if (anoAtualSpan) {
    anoAtualSpan.textContent = new Date().getFullYear();
  }
});

// 2. Efeito de Animação ao Fazer Scroll (Reveal / Fade In)
function reveal() {
  var reveals = document.querySelectorAll(".reveal");

  for (var i = 0; i < reveals.length; i++) {
    var windowHeight = window.innerHeight;
    var elementTop = reveals[i].getBoundingClientRect().top;
    var elementVisible = 100; // Distância em pixels antes do elemento aparecer

    if (elementTop < windowHeight - elementVisible) {
      reveals[i].style.opacity = 1;
      reveals[i].style.transform = "translateY(0)";
    }
  }
}

// 3. Preparar os elementos e rodar a animação logo que a página carrega
document.addEventListener("DOMContentLoaded", function () {
  var reveals = document.querySelectorAll(".reveal");

  // Define o estado inicial invisível para todos os elementos que têm a classe "reveal"
  reveals.forEach(function (el) {
    el.style.opacity = 0;
    el.style.transform = "translateY(30px)";
    el.style.transition = "all 0.8s cubic-bezier(0.5, 0, 0, 1)"; // Transição muito suave e profissional
  });

  // Dispara a função uma vez para mostrar os elementos que já estão no ecrã (ex: Hero Section)
  setTimeout(reveal, 100);
});

// 4. Ouve o evento de scroll da página para disparar a função conforme o utilizador desce
window.addEventListener("scroll", reveal);