// ==========================================
// GUNTER - USUARIOS FRONTEND
// Archivo: java/usuarios.js
// ==========================================

let usuarios = JSON.parse(localStorage.getItem("gunter_usuarios")) || [];

document.addEventListener("DOMContentLoaded", () => {
  asegurarUsuariosBase();
  renderizarUsuarios(usuarios);
  actualizarEstadisticasUsuarios();
  inicializarBuscadorUsuarios();
});

function asegurarUsuariosBase() {
  if (usuarios.length > 0) return;

  usuarios = [
    {
      id: "U-ADMIN",
      nombre: "Administrador Gunter",
      email: "admin@gunter.com",
      telefono: "664 000 0000",
      rol: "admin",
      fechaRegistro: new Date().toISOString()
    }
  ];

  guardarUsuarios();
}

function renderizarUsuarios(listaUsuarios) {
  const tabla = document.getElementById("tabla-usuarios");

  if (!tabla) return;

  if (!listaUsuarios.length) {
    tabla.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-muted py-5">
          No hay usuarios para mostrar.
        </td>
      </tr>
    `;
    return;
  }

  tabla.innerHTML = "";

  listaUsuarios.forEach(usuario => {
    const fila = document.createElement("tr");

    const inicial = obtenerInicial(usuario.nombre);
    const fecha = formatearFecha(usuario.fechaRegistro);

    fila.innerHTML = `
      <td>
        <div class="d-flex align-items-center gap-3">
          <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold" style="width: 42px; height: 42px;">
            ${inicial}
          </div>

          <div>
            <div class="fw-bold">${escaparHTMLUsuarios(usuario.nombre)}</div>
            <div class="text-muted small">ID: ${escaparHTMLUsuarios(usuario.id)}</div>
          </div>
        </div>
      </td>

      <td>${escaparHTMLUsuarios(usuario.email)}</td>

      <td>${escaparHTMLUsuarios(usuario.telefono || "No registrado")}</td>

      <td>
        <span class="badge ${usuario.rol === "admin" ? "bg-dark" : "bg-success"}">
          ${usuario.rol}
        </span>
      </td>

      <td>
        <span class="text-muted small">${fecha}</span>
      </td>

      <td class="text-end">
        <button class="btn btn-sm btn-outline-danger rounded-pill" onclick="eliminarUsuario('${usuario.id}')">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `;

    tabla.appendChild(fila);
  });
}

function inicializarBuscadorUsuarios() {
  const input = document.getElementById("buscar-usuario");

  if (!input) return;

  input.addEventListener("input", () => {
    const busqueda = input.value.toLowerCase().trim();

    const filtrados = usuarios.filter(usuario => {
      return (
        usuario.nombre.toLowerCase().includes(busqueda) ||
        usuario.email.toLowerCase().includes(busqueda) ||
        String(usuario.telefono || "").toLowerCase().includes(busqueda) ||
        usuario.rol.toLowerCase().includes(busqueda)
      );
    });

    renderizarUsuarios(filtrados);
  });
}

function eliminarUsuario(id) {
  if (id === "U-ADMIN") {
    alert("No puedes eliminar el usuario administrador base.");
    return;
  }

  const confirmar = confirm("¿Seguro que quieres eliminar este usuario?");

  if (!confirmar) return;

  usuarios = usuarios.filter(usuario => usuario.id !== id);

  guardarUsuarios();
  renderizarUsuarios(usuarios);
  actualizarEstadisticasUsuarios();
}

function actualizarEstadisticasUsuarios() {
  const totalUsuarios = document.getElementById("total-usuarios");
  const totalClientes = document.getElementById("total-clientes");
  const totalAdmins = document.getElementById("total-admins");

  const clientes = usuarios.filter(usuario => usuario.rol === "cliente").length;
  const admins = usuarios.filter(usuario => usuario.rol === "admin").length;

  if (totalUsuarios) totalUsuarios.textContent = usuarios.length;
  if (totalClientes) totalClientes.textContent = clientes;
  if (totalAdmins) totalAdmins.textContent = admins;
}

function guardarUsuarios() {
  localStorage.setItem("gunter_usuarios", JSON.stringify(usuarios));
}

function obtenerInicial(nombre) {
  if (!nombre) return "U";
  return nombre.trim().charAt(0).toUpperCase();
}

function formatearFecha(fechaISO) {
  if (!fechaISO) return "Sin fecha";

  const fecha = new Date(fechaISO);

  if (isNaN(fecha.getTime())) {
    return "Sin fecha";
  }

  return fecha.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function escaparHTMLUsuarios(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}