// ==========================================
// GUNTER - REGISTRO FRONTEND
// Archivo: java/registro.js
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  inicializarRegistro();
  inicializarTogglePassword("toggle-password", "password");
  inicializarTogglePassword("toggle-confirm-password", "confirm-password");
});

function inicializarRegistro() {
  const form = document.getElementById("register-form");

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const email = document.getElementById("email").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (!validarRegistro(nombre, email, password, confirmPassword)) return;

    const usuarios = JSON.parse(localStorage.getItem("gunter_usuarios")) || [];

    const usuarioExistente = usuarios.find(usuario => {
      return usuario.email.toLowerCase() === email.toLowerCase();
    });

    if (usuarioExistente) {
      mostrarAlerta("Este correo ya está registrado.", "danger");
      return;
    }

    const nuevoUsuario = {
      id: "U-" + Date.now(),
      nombre: nombre,
      email: email,
      telefono: telefono,
      rol: "cliente",
      fechaRegistro: new Date().toISOString()
    };

    usuarios.push(nuevoUsuario);

    localStorage.setItem("gunter_usuarios", JSON.stringify(usuarios));
    localStorage.setItem("gunter_usuario", JSON.stringify({
      ...nuevoUsuario,
      sesionActiva: true
    }));

    mostrarAlerta("Cuenta creada correctamente. Redirigiendo...", "success");

    setTimeout(() => {
      window.location.href = "index.html";
    }, 900);
  });
}

function validarRegistro(nombre, email, password, confirmPassword) {
  if (!nombre || !email || !password || !confirmPassword) {
    mostrarAlerta("Completa todos los campos obligatorios.", "danger");
    return false;
  }

  if (nombre.length < 3) {
    mostrarAlerta("El nombre debe tener mínimo 3 caracteres.", "danger");
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

  if (password !== confirmPassword) {
    mostrarAlerta("Las contraseñas no coinciden.", "danger");
    return false;
  }

  return true;
}

function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function inicializarTogglePassword(btnId, inputId) {
  const btn = document.getElementById(btnId);
  const input = document.getElementById(inputId);

  if (!btn || !input) return;

  btn.addEventListener("click", () => {
    const estaOculta = input.type === "password";

    input.type = estaOculta ? "text" : "password";
    btn.innerHTML = estaOculta 
      ? '<i class="bi bi-eye-slash"></i>' 
      : '<i class="bi bi-eye"></i>';
  });
}

function mostrarAlerta(mensaje, tipo = "danger") {
  const alerta = document.getElementById("register-alert");

  if (!alerta) {
    alert(mensaje);
    return;
  }

  alerta.className = `alert alert-${tipo} rounded-3`;
  alerta.textContent = mensaje;
  alerta.classList.remove("d-none");
}