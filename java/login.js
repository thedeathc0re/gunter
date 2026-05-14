// ==========================================
// GUNTER - LOGIN FRONTEND
// Archivo: java/login.js
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  inicializarLogin();
  inicializarTogglePassword();
  cargarEmailRecordado();
});

function inicializarLogin() {
  const form = document.getElementById("login-form");

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const rememberUser = document.getElementById("remember-user").checked;

    if (!validarLogin(email, password)) return;

    if (rememberUser) {
      localStorage.setItem("gunter_email_recordado", email);
    } else {
      localStorage.removeItem("gunter_email_recordado");
    }

    // Login temporal para frontend.
    // Después esto se cambiará por fetch("login.php").
    const usuarioTemporal = {
      id: "U-" + Date.now(),
      nombre: obtenerNombreDesdeEmail(email),
      email: email,
      rol: email.includes("admin") ? "admin" : "cliente",
      sesionActiva: true
    };

    localStorage.setItem("gunter_usuario", JSON.stringify(usuarioTemporal));

    mostrarAlerta("Inicio de sesión correcto. Redirigiendo...", "success");

    setTimeout(() => {
      window.location.href = "index.html";
    }, 800);
  });
}

function validarLogin(email, password) {
  if (!email || !password) {
    mostrarAlerta("Completa todos los campos.", "danger");
    return false;
  }

  if (!validarEmail(email)) {
    mostrarAlerta("Ingresa un correo electrónico válido.", "danger");
    return false;
  }

  if (password.length < 6) {
    mostrarAlerta("La contraseña debe tener mínimo 6 caracteres.", "danger");
    return false;
  }

  return true;
}

function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function inicializarTogglePassword() {
  const btn = document.getElementById("toggle-password");
  const input = document.getElementById("password");

  if (!btn || !input) return;

  btn.addEventListener("click", () => {
    const estaOculta = input.type === "password";

    input.type = estaOculta ? "text" : "password";
    btn.innerHTML = estaOculta 
      ? '<i class="bi bi-eye-slash"></i>' 
      : '<i class="bi bi-eye"></i>';
  });
}

function cargarEmailRecordado() {
  const emailRecordado = localStorage.getItem("gunter_email_recordado");
  const inputEmail = document.getElementById("email");
  const rememberUser = document.getElementById("remember-user");

  if (!emailRecordado || !inputEmail || !rememberUser) return;

  inputEmail.value = emailRecordado;
  rememberUser.checked = true;
}

function obtenerNombreDesdeEmail(email) {
  return email.split("@")[0]
    .replaceAll(".", " ")
    .replaceAll("_", " ")
    .replaceAll("-", " ");
}

function mostrarAlerta(mensaje, tipo = "danger") {
  const alerta = document.getElementById("login-alert");

  if (!alerta) {
    alert(mensaje);
    return;
  }

  alerta.className = `alert alert-${tipo} rounded-3`;
  alerta.textContent = mensaje;
  alerta.classList.remove("d-none");
}