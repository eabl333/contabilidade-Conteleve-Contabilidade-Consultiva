/* =========================================================
   Conteleve - interações do site
   ========================================================= */

// >>> Troque aqui se o WhatsApp for outro número (formato: 55 + DDD + número)
const WHATSAPP_NUMBER = "5511949628935";

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

function openWhatsApp(text) {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "noopener");
}

/* Ano no rodapé */
$("#year").textContent = new Date().getFullYear();

/* Header: sombra ao rolar */
const header = $("#header");
const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 10);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

/* Menu mobile */
const burger = $("#burger");
const nav = $("#nav");
function setMenu(open) {
  nav.classList.toggle("open", open);
  burger.setAttribute("aria-expanded", String(open));
}
burger.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
$$("#nav a").forEach(a => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });

/* Animação de entrada ao rolar */
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  $$(".reveal").forEach((el, i) => {
    el.style.transitionDelay = `${(i % 3) * 80}ms`;
    io.observe(el);
  });
} else {
  $$(".reveal").forEach(el => el.classList.add("in"));
}

/* Cartão "O que você precisa agora?" abre o WhatsApp já com o assunto */
$$(".need").forEach(btn => {
  btn.addEventListener("click", () => {
    openWhatsApp(`Olá, Conteleve! ${btn.dataset.msg}. Pode me ajudar?`);
  });
});

/* Links de serviço preenchem o campo do formulário */
$$("[data-service]").forEach(link => {
  link.addEventListener("click", () => {
    const select = $("#servico");
    const value = link.dataset.service;
    const opt = [...select.options].find(o => o.textContent.trim() === value);
    if (opt) select.value = opt.value || opt.textContent;
  });
});

/* Formulário: valida e envia para o WhatsApp */
const form = $("#leadForm");
const msg = $("#formMsg");

function maskPhone(v) {
  v = v.replace(/\D/g, "").slice(0, 11);
  if (v.length > 6) return `(${v.slice(0,2)}) ${v.slice(2, v.length - 4)}-${v.slice(-4)}`;
  if (v.length > 2) return `(${v.slice(0,2)}) ${v.slice(2)}`;
  return v;
}
form.telefone.addEventListener("input", e => { e.target.value = maskPhone(e.target.value); });

form.addEventListener("submit", e => {
  e.preventDefault();
  msg.className = "form__msg";
  let ok = true;
  [form.nome, form.telefone, form.servico].forEach(f => f.classList.remove("invalid"));

  if (form.nome.value.trim().length < 2) { form.nome.classList.add("invalid"); ok = false; }
  if (form.telefone.value.replace(/\D/g, "").length < 10) { form.telefone.classList.add("invalid"); ok = false; }
  if (!form.servico.value) { form.servico.classList.add("invalid"); ok = false; }
  if (form.email.value && !/^\S+@\S+\.\S+$/.test(form.email.value)) { form.email.classList.add("invalid"); ok = false; }

  if (!ok) { msg.textContent = "Confira os campos destacados."; return; }

  const text =
`Olá, Conteleve! Vim pelo site.
Nome: ${form.nome.value.trim()}
WhatsApp: ${form.telefone.value}
${form.email.value ? "E-mail: " + form.email.value.trim() + "\n" : ""}Assunto: ${form.servico.value}
Gostaria de agendar um diagnóstico contábil.`;

  openWhatsApp(text);
  msg.classList.add("ok");
  msg.textContent = "Abrindo o WhatsApp com os seus dados...";
  form.reset();
});

/* Botão flutuante do WhatsApp */
const waBtn = $("#waBtn");
const waPanel = $("#waPanel");
waBtn.addEventListener("click", () => { waPanel.hidden = !waPanel.hidden; });
$$("#waPanel button").forEach(b => {
  b.addEventListener("click", () => {
    openWhatsApp(`Olá, Conteleve! ${b.dataset.msg}.`);
    waPanel.hidden = true;
  });
});
document.addEventListener("click", e => {
  if (!$("#wa").contains(e.target)) waPanel.hidden = true;
});

/* Abre o painel do WhatsApp sozinho uma vez, depois de 12s */
setTimeout(() => {
  if (!sessionStorage.getItem("waShown")) {
    waPanel.hidden = false;
    try { sessionStorage.setItem("waShown", "1"); } catch (_) {}
  }
}, 12000);
