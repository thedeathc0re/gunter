// ==========================================
// GUNTER MARKETPLACE - FRONTEND LOGIC
// Archivo: java/Java.js
// ==========================================

// Carrito global usando localStorage
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// ==========================================
// INICIALIZACIÓN GENERAL
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  normalizarCarrito();
  actualizarTodo();
  inicializarBuscador();
  inicializarFiltrosSubcategoria();
  prepararBotonesCarrito();
});

// ==========================================
// NORMALIZAR CARRITO
// ==========================================

function normalizarCarrito() {
  carrito = carrito
    .filter(item => item && item.id && item.nombre)
    .map(item => {
      return {
        id: String(item.id),
        nombre: String(item.nombre),
        precio: Number(item.precio) || 0,
        imagen: item.imagen || "https://placehold.co/600x600/e5e7eb/111827?text=Gunter",
        cantidad: Number(item.cantidad) > 0 ? Number(item.cantidad) : 1
      };
    });

  guardarCarrito();
}

// ==========================================
// BUSCADOR DE PRODUCTOS
// ==========================================

function inicializarBuscador() {
  const searchInput = document.getElementById("search-input");

  if (!searchInput) return;

  searchInput.addEventListener("input", () => {
    const textoBusqueda = searchInput.value.toLowerCase().trim();
    const tarjetas = document.querySelectorAll(".item-card");

    let hayResultados = false;

    tarjetas.forEach((tarjeta) => {
      const contenedor = tarjeta.closest('[class*="col-"]');

      const titulo = tarjeta.querySelector(".item-title")?.textContent.toLowerCase() || "";
      const precio = tarjeta.querySelector(".item-price")?.textContent.toLowerCase() || "";
      const categoria = tarjeta.dataset.subcategoria?.toLowerCase() || "";
      const textoCompleto = tarjeta.textContent.toLowerCase();

      const coincide =
        titulo.includes(textoBusqueda) ||
        precio.includes(textoBusqueda) ||
        categoria.includes(textoBusqueda) ||
        textoCompleto.includes(textoBusqueda);

      if (coincide) {
        contenedor?.classList.remove("d-none");
        hayResultados = true;
      } else {
        contenedor?.classList.add("d-none");
      }
    });

    mostrarMensajeSinResultados(hayResultados);
  });
}

function mostrarMensajeSinResultados(hayResultados) {
  let mensaje = document.getElementById("no-results");
  const productGrid = document.getElementById("product-grid");

  if (!productGrid) return;

  if (!mensaje) {
    mensaje = document.createElement("div");
    mensaje.id = "no-results";
    mensaje.className = "col-12 text-center text-muted py-5 d-none";
    mensaje.innerHTML = `
      <div class="p-4 bg-white rounded-4 shadow-sm">
        <i class="bi bi-search fs-1 d-block mb-3 text-primary"></i>
        <h5 class="fw-bold">No encontramos productos</h5>
        <p class="mb-0">Intenta buscar con otro nombre o categoría.</p>
      </div>
    `;

    productGrid.appendChild(mensaje);
  }

  if (hayResultados) {
    mensaje.classList.add("d-none");
  } else {
    mensaje.classList.remove("d-none");
  }
}

// ==========================================
// FILTROS DE SUBCATEGORÍA
// ==========================================

function inicializarFiltrosSubcategoria() {
  const botonesFiltro = document.querySelectorAll(".filtro-subcategoria");

  if (!botonesFiltro.length) return;

  botonesFiltro.forEach(boton => {
    boton.addEventListener("click", () => {
      const filtro = boton.dataset.filtro?.toLowerCase() || "";
      filtrarPorSubcategoria(filtro);

      botonesFiltro.forEach(btn => btn.classList.remove("active"));
      boton.classList.add("active");
    });
  });
}

function filtrarPorSubcategoria(filtro) {
  const tarjetas = document.querySelectorAll(".item-card");
  let hayResultados = false;

  tarjetas.forEach(tarjeta => {
    const contenedor = tarjeta.closest('[class*="col-"]');
    const subcategoria = tarjeta.dataset.subcategoria?.toLowerCase() || "";

    const coincide = subcategoria === filtro;

    if (coincide) {
      contenedor?.classList.remove("d-none");
      hayResultados = true;
    } else {
      contenedor?.classList.add("d-none");
    }
  });

  mostrarMensajeSinResultados(hayResultados);
}

// ==========================================
// PREPARAR BOTONES DE CARRITO
// ==========================================

function prepararBotonesCarrito() {
  const botones = document.querySelectorAll(".btn-add");

  botones.forEach((boton, index) => {
    boton.addEventListener("click", () => {
      const tarjeta = boton.closest(".item-card");

      if (!tarjeta) return;

      const id = boton.dataset.id || generarIdProducto(tarjeta, index);
      const nombre = boton.dataset.nombre || obtenerTexto(tarjeta, ".item-title", "Producto Gunter");
      const precioTexto = boton.dataset.precio || obtenerTexto(tarjeta, ".item-price", "$0");
      const precio = limpiarPrecio(precioTexto);
      const imagen = boton.dataset.imagen || tarjeta.querySelector("img")?.getAttribute("src") || "";

      agregarCarrito(id, nombre, precio, imagen);
    });
  });
}

function generarIdProducto(tarjeta, index) {
  const nombre = obtenerTexto(tarjeta, ".item-title", `producto-${index}`);

  return nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replaceAll(" ", "-")
    .replace(/[^\w-]/g, "");
}

function obtenerTexto(contenedor, selector, valorDefault = "") {
  return contenedor.querySelector(selector)?.textContent.trim() || valorDefault;
}

function limpiarPrecio(precioTexto) {
  return Number(
    String(precioTexto)
      .replace("$", "")
      .replaceAll(",", "")
      .replace("MXN", "")
      .trim()
  ) || 0;
}

// ==========================================
// LÓGICA DEL CARRITO
// ==========================================

function agregarCarrito(id, nombre, precio, imagen) {
  if (!id || !nombre) {
    alert("No se pudo agregar el producto.");
    return;
  }

  const productoExistente = carrito.find(
    item => String(item.id) === String(id)
  );

  if (productoExistente) {
    productoExistente.cantidad += 1;
  } else {
    carrito.push({
      id: String(id),
      nombre: String(nombre),
      precio: Number(precio) || 0,
      imagen: imagen || "https://placehold.co/600x600/e5e7eb/111827?text=Gunter",
      cantidad: 1
    });
  }

  actualizarTodo();
  mostrarToastCarrito(nombre);
}

function cambiarCantidad(id, cambio) {
  const producto = carrito.find(
    item => String(item.id) === String(id)
  );

  if (!producto) return;

  producto.cantidad += cambio;

  if (producto.cantidad <= 0) {
    eliminarDelCarrito(id);
    return;
  }

  actualizarTodo();
}

function actualizarCantidadManual(id, valor) {
  const nuevaCantidad = parseInt(valor);
  const producto = carrito.find(
    item => String(item.id) === String(id)
  );

  if (!producto) return;

  if (!isNaN(nuevaCantidad) && nuevaCantidad > 0) {
    producto.cantidad = nuevaCantidad;
  } else {
    producto.cantidad = 1;
  }

  actualizarTodo();
}

function eliminarDelCarrito(id) {
  carrito = carrito.filter(
    item => String(item.id) !== String(id)
  );

  actualizarTodo();
}

function limpiarCarrito() {
  if (!carrito.length) {
    alert("Tu carrito ya está vacío.");
    return;
  }

  const confirmar = confirm("¿Estás seguro de que quieres vaciar el carrito?");

  if (!confirmar) return;

  carrito = [];
  actualizarTodo();
}

function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

// ==========================================
// MOSTRAR CARRITO EN carrito.html
// ==========================================

function mostrarCarrito() {
  const lista = document.getElementById("cart-items");
  const totalElemento = document.getElementById("cart-total");
  const subtotalElemento = document.getElementById("subtotal-val");

  if (!lista) return;

  lista.innerHTML = "";

  if (carrito.length === 0) {
    lista.innerHTML = `
      <li class="list-group-item border-0 text-center py-5">
        <i class="bi bi-bag-x fs-1 text-muted d-block mb-3"></i>
        <h5 class="fw-bold">Tu carrito está vacío</h5>
        <p class="text-muted mb-3">Agrega productos para continuar con tu compra.</p>
        <a href="index.html" class="btn btn-primary rounded-pill px-4 fw-bold">
          Ver productos
        </a>
      </li>
    `;

    if (totalElemento) totalElemento.innerText = "0.00";
    if (subtotalElemento) subtotalElemento.innerText = "$0.00";

    return;
  }

  let sumaTotal = 0;

  carrito.forEach((producto) => {
    const subtotal = producto.precio * producto.cantidad;
    sumaTotal += subtotal;

    const li = document.createElement("li");
    li.className = "list-group-item py-4 border-0 border-bottom";

    li.innerHTML = `
      <div class="d-flex align-items-center gap-3">
        <img 
          src="${escaparAtributo(producto.imagen)}" 
          alt="${escaparAtributo(producto.nombre)}"
          style="width: 80px; height: 80px; object-fit: cover; border-radius: 16px;"
        >

        <div class="flex-grow-1">
          <h6 class="fw-bold mb-1">${escaparHTML(producto.nombre)}</h6>
          <p class="text-muted small mb-2">$${formatearPrecio(producto.precio)}</p>

          <div class="d-flex align-items-center gap-2">
            <button 
              class="btn btn-sm btn-outline-dark rounded-circle" 
              onclick="cambiarCantidad('${escaparAtributo(producto.id)}', -1)"
              aria-label="Disminuir cantidad"
            >
              <i class="bi bi-dash"></i>
            </button>

            <input 
              type="number" 
              min="1" 
              value="${producto.cantidad}" 
              class="form-control form-control-sm text-center"
              style="width: 70px;"
              onchange="actualizarCantidadManual('${escaparAtributo(producto.id)}', this.value)"
            >

            <button 
              class="btn btn-sm btn-outline-dark rounded-circle" 
              onclick="cambiarCantidad('${escaparAtributo(producto.id)}', 1)"
              aria-label="Aumentar cantidad"
            >
              <i class="bi bi-plus"></i>
            </button>
          </div>
        </div>

        <div class="text-end">
          <strong>$${formatearPrecio(subtotal)}</strong>

          <button 
            class="btn btn-sm text-danger d-block ms-auto mt-2" 
            onclick="eliminarDelCarrito('${escaparAtributo(producto.id)}')"
            aria-label="Eliminar producto"
          >
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    `;

    lista.appendChild(li);
  });

  if (totalElemento) {
    totalElemento.innerText = formatearPrecio(sumaTotal);
  }

  if (subtotalElemento) {
    subtotalElemento.innerText = `$${formatearPrecio(sumaTotal)}`;
  }
}

// ==========================================
// FINALIZAR COMPRA
// ==========================================

function finalizarCompra() {
  if (carrito.length === 0) {
    alert("Tu carrito está vacío.");
    return;
  }

  const confirmar = confirm("¿Deseas finalizar tu pedido?");

  if (!confirmar) return;

  alert("¡Pedido realizado con éxito! Gracias por confiar en Gunter.");

  carrito = [];
  actualizarTodo();

  window.location.href = "index.html";
}

// ==========================================
// ACTUALIZAR TODO
// ==========================================

function actualizarTodo() {
  guardarCarrito();
  actualizarContadorCarrito();
  mostrarCarrito();
}

function actualizarContadorCarrito() {
  const badge = document.getElementById("cart-count");

  if (!badge) return;

  const totalItems = carrito.reduce(
    (total, item) => total + item.cantidad,
    0
  );

  badge.innerText = totalItems;
  badge.style.display = totalItems > 0 ? "block" : "none";
}

// ==========================================
// UTILIDADES
// ==========================================

function formatearPrecio(precio) {
  return Number(precio).toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function escaparHTML(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

function escaparAtributo(texto) {
  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function mostrarToastCarrito(nombreProducto) {
  const toastAnterior = document.getElementById("gunter-toast");

  if (toastAnterior) {
    toastAnterior.remove();
  }

  const toast = document.createElement("div");
  toast.id = "gunter-toast";
  toast.className = "position-fixed bottom-0 end-0 m-4 bg-dark text-white rounded-4 shadow-lg p-3";
  toast.style.zIndex = "9999";

  toast.innerHTML = `
    <div class="d-flex align-items-center gap-3">
      <i class="bi bi-check-circle-fill text-success fs-4"></i>
      <div>
        <strong>Agregado al carrito</strong>
        <div class="small text-white-50">${escaparHTML(nombreProducto)}</div>
      </div>
    </div>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    if (toast) {
      toast.remove();
    }
  }, 2200);
}