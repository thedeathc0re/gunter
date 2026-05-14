// ==========================================
// GUNTER MARKETPLACE - FRONTEND LOGIC
// Archivo: java/Java.js
// ==========================================

let carrito = cargarCarritoSeguro();
let productosPagina = [];

// ==========================================
// INICIO
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  normalizarCarrito();
  actualizarTodo();

  const productGrid = document.getElementById("product-grid");

  if (productGrid) {
    const yaHayProductosEnHTML = productGrid.querySelectorAll(".item-card").length > 0;

    if (yaHayProductosEnHTML) {
      prepararBotonesCarrito();
      productosPagina = obtenerProductosDesdeHTML();
    } else {
      cargarProductosDesdeBackend();
    }
  }

  inicializarBuscador();
  inicializarFiltrosSubcategoria();
});

// ==========================================
// CARGAR CARRITO SEGURO
// ==========================================

function cargarCarritoSeguro() {
  try {
    const carritoGuardado = localStorage.getItem("carrito");

    if (
      !carritoGuardado ||
      carritoGuardado === "undefined" ||
      carritoGuardado === "null"
    ) {
      localStorage.removeItem("carrito");
      return [];
    }

    const datos = JSON.parse(carritoGuardado);

    if (!Array.isArray(datos)) {
      localStorage.removeItem("carrito");
      return [];
    }

    return datos;
  } catch (error) {
    console.warn("Carrito dañado en localStorage. Se reinició.", error);
    localStorage.removeItem("carrito");
    return [];
  }
}

// ==========================================
// CARGAR PRODUCTOS DESDE BACKEND
// ==========================================

async function cargarProductosDesdeBackend() {
  const productGrid = document.getElementById("product-grid");

  if (!productGrid) return;

  const categoria = document.body.dataset.categoria || "Tendencias";

  try {
    const respuesta = await fetch(`productos.php?categoria=${encodeURIComponent(categoria)}`);

    if (!respuesta.ok) {
      throw new Error("No se pudo conectar con productos.php");
    }

    const data = await respuesta.json();

    if (!data.success) {
      throw new Error(data.error || "Error al cargar productos");
    }

    productosPagina = data.productos || [];
    renderizarProductos(productosPagina);

  } catch (error) {
    console.error("Error cargando productos:", error);

    productGrid.innerHTML = `
      <div class="col-12">
        <div class="alert alert-warning rounded-4 shadow-sm">
          No se pudieron cargar los productos desde el backend.
          Revisa que <strong>productos.php</strong> exista y que MariaDB esté funcionando.
        </div>
      </div>
    `;
  }
}

// ==========================================
// OBTENER PRODUCTOS DESDE HTML ESTÁTICO
// Compatible mientras migras a MariaDB
// ==========================================

function obtenerProductosDesdeHTML() {
  const tarjetas = document.querySelectorAll(".item-card");

  return Array.from(tarjetas).map((tarjeta, index) => {
    const boton = tarjeta.querySelector(".btn-add");

    return {
      id_producto: boton?.dataset.id || generarIdProducto(tarjeta, index),
      nombre: boton?.dataset.nombre || obtenerTexto(tarjeta, ".item-title", "Producto Gunter"),
      precio: limpiarPrecio(boton?.dataset.precio || obtenerTexto(tarjeta, ".item-price", "$0")),
      imagen: boton?.dataset.imagen || tarjeta.querySelector("img")?.getAttribute("src") || "",
      subcategoria: tarjeta.dataset.subcategoria || "",
      stock: 1,
      vendidos: 0
    };
  });
}

// ==========================================
// RENDER DE PRODUCTOS DESDE BACKEND
// ==========================================

function renderizarProductos(productos) {
  const productGrid = document.getElementById("product-grid");

  if (!productGrid) return;

  if (!productos.length) {
    productGrid.innerHTML = `
      <div class="col-12 text-center text-muted py-5">
        <div class="p-4 bg-white rounded-4 shadow-sm">
          <i class="bi bi-box-seam fs-1 d-block mb-3 text-primary"></i>
          <h5 class="fw-bold">No hay productos disponibles</h5>
          <p class="mb-0">Agrega productos desde Gestión Stock.</p>
        </div>
      </div>
    `;
    return;
  }

  productGrid.innerHTML = "";

  productos.forEach(producto => {
    const col = document.createElement("div");
    col.className = "col-md-4 col-sm-6";

    const stock = Number(producto.stock) || 0;
    const vendidos = Number(producto.vendidos) || 0;

    let badge = `<span class="badge-premium bg-primary">Nuevo</span>`;

    if (stock <= 0) {
      badge = `<span class="badge-premium bg-danger">Agotado</span>`;
    } else if (vendidos >= 20) {
      badge = `<span class="badge-premium bg-dark">Top Ventas</span>`;
    }

    col.innerHTML = `
      <div class="item-card" data-subcategoria="${escaparAtributo(producto.subcategoria || "")}">
        <div class="img-wrapper">
          ${badge}
          <img 
            src="${escaparAtributo(producto.imagen)}" 
            alt="${escaparAtributo(producto.nombre)}"
            onerror="this.src='https://placehold.co/600x600/e5e7eb/111827?text=Gunter'"
          >
        </div>

        <div class="item-info">
          <span class="item-price">$${formatearPrecio(producto.precio)}</span>

          <h6 class="item-title text-truncate">
            ${escaparHTML(producto.nombre)}
          </h6>

          <p class="text-muted small mb-2">
            <i class="bi bi-geo-alt"></i> Tijuana
          </p>

          <button 
            class="btn-add w-100"
            data-id="${escaparAtributo(producto.id_producto)}"
            data-nombre="${escaparAtributo(producto.nombre)}"
            data-precio="${escaparAtributo(producto.precio)}"
            data-imagen="${escaparAtributo(producto.imagen)}"
            ${stock <= 0 ? "disabled" : ""}
          >
            ${stock > 0 ? "Añadir al carrito" : "Producto agotado"}
          </button>
        </div>
      </div>
    `;

    productGrid.appendChild(col);
  });

  prepararBotonesCarrito();
}

// ==========================================
// BOTONES DE CARRITO
// ==========================================

function prepararBotonesCarrito() {
  const botones = document.querySelectorAll(".btn-add");

  botones.forEach((boton, index) => {
    boton.onclick = () => {
      const tarjeta = boton.closest(".item-card");

      if (!tarjeta) {
        alert("No se pudo detectar el producto.");
        return;
      }

      const id = boton.dataset.id || generarIdProducto(tarjeta, index);
      const nombre = boton.dataset.nombre || obtenerTexto(tarjeta, ".item-title", "Producto Gunter");
      const precioTexto = boton.dataset.precio || obtenerTexto(tarjeta, ".item-price", "$0");
      const precio = limpiarPrecio(precioTexto);
      const imagen = boton.dataset.imagen || tarjeta.querySelector("img")?.getAttribute("src") || "";

      agregarCarrito(id, nombre, precio, imagen);
    };
  });
}

function agregarCarrito(id, nombre, precio, imagen) {
  if (!id || !nombre) {
    alert("No se pudo agregar el producto.");
    return;
  }

  const productoExistente = carrito.find(item => String(item.id) === String(id));

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

// ==========================================
// CARRITO
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

  carrito.forEach(producto => {
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
          onerror="this.src='https://placehold.co/600x600/e5e7eb/111827?text=Gunter'"
        >

        <div class="flex-grow-1">
          <h6 class="fw-bold mb-1">${escaparHTML(producto.nombre)}</h6>
          <p class="text-muted small mb-2">$${formatearPrecio(producto.precio)}</p>

          <div class="d-flex align-items-center gap-2">
            <button 
              class="btn btn-sm btn-outline-dark rounded-circle" 
              onclick="cambiarCantidad('${escaparAtributo(producto.id)}', -1)"
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
          >
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    `;

    lista.appendChild(li);
  });

  if (totalElemento) totalElemento.innerText = formatearPrecio(sumaTotal);
  if (subtotalElemento) subtotalElemento.innerText = `$${formatearPrecio(sumaTotal)}`;
}

function cambiarCantidad(id, cambio) {
  const producto = carrito.find(item => String(item.id) === String(id));

  if (!producto) return;

  producto.cantidad += cambio;

  if (producto.cantidad <= 0) {
    eliminarDelCarrito(id);
    return;
  }

  actualizarTodo();
}

function actualizarCantidadManual(id, valor) {
  const producto = carrito.find(item => String(item.id) === String(id));
  const cantidad = parseInt(valor);

  if (!producto) return;

  producto.cantidad = cantidad > 0 ? cantidad : 1;

  actualizarTodo();
}

function eliminarDelCarrito(id) {
  carrito = carrito.filter(item => String(item.id) !== String(id));
  actualizarTodo();
}

function limpiarCarrito() {
  if (!carrito.length) {
    alert("Tu carrito ya está vacío.");
    return;
  }

  if (!confirm("¿Seguro que quieres vaciar el carrito?")) return;

  carrito = [];
  actualizarTodo();
}

async function finalizarCompra() {
  if (!carrito.length) {
    alert("Tu carrito está vacío.");
    return;
  }

  if (!confirm("¿Deseas finalizar tu pedido?")) return;

  try {
    const usuarioGuardado = localStorage.getItem("gunter_usuario");
    let usuario = null;

    if (
      usuarioGuardado &&
      usuarioGuardado !== "undefined" &&
      usuarioGuardado !== "null"
    ) {
      usuario = JSON.parse(usuarioGuardado);
    }

    const respuesta = await fetch("crear-pedido.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        usuario,
        carrito
      })
    });

    const data = await respuesta.json();

    if (!data.success) {
      throw new Error(data.error || "No se pudo crear el pedido");
    }

    alert(`Pedido creado correctamente. Folio #${data.id_pedido}`);

  } catch (error) {
    console.warn("Backend de pedidos no disponible. Pedido local.", error);
    alert("Pedido finalizado localmente. Después se conectará con MariaDB.");
  }

  carrito = [];
  actualizarTodo();
  window.location.href = "index.html";
}

// ==========================================
// BUSCADOR Y FILTROS
// ==========================================

function inicializarBuscador() {
  const searchInput = document.getElementById("search-input");

  if (!searchInput) return;

  searchInput.addEventListener("input", () => {
    const textoBusqueda = searchInput.value.toLowerCase().trim();
    const tarjetas = document.querySelectorAll(".item-card");

    let hayResultados = false;

    tarjetas.forEach(tarjeta => {
      const contenedor = tarjeta.closest('[class*="col-"]');
      const texto = tarjeta.textContent.toLowerCase();
      const subcategoria = tarjeta.dataset.subcategoria?.toLowerCase() || "";

      const coincide = texto.includes(textoBusqueda) || subcategoria.includes(textoBusqueda);

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

function inicializarFiltrosSubcategoria() {
  const botonesFiltro = document.querySelectorAll(".filtro-subcategoria");

  botonesFiltro.forEach(boton => {
    boton.addEventListener("click", () => {
      const filtro = boton.dataset.filtro?.toLowerCase() || "";
      const tarjetas = document.querySelectorAll(".item-card");

      let hayResultados = false;

      tarjetas.forEach(tarjeta => {
        const contenedor = tarjeta.closest('[class*="col-"]');
        const subcategoria = tarjeta.dataset.subcategoria?.toLowerCase() || "";

        if (subcategoria === filtro) {
          contenedor?.classList.remove("d-none");
          hayResultados = true;
        } else {
          contenedor?.classList.add("d-none");
        }
      });

      botonesFiltro.forEach(btn => btn.classList.remove("active"));
      boton.classList.add("active");

      mostrarMensajeSinResultados(hayResultados);
    });
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
// UTILIDADES
// ==========================================

function normalizarCarrito() {
  carrito = carrito
    .filter(item => item && item.id && item.nombre)
    .map(item => ({
      id: String(item.id),
      nombre: String(item.nombre),
      precio: Number(item.precio) || 0,
      imagen: item.imagen || "https://placehold.co/600x600/e5e7eb/111827?text=Gunter",
      cantidad: Number(item.cantidad) > 0 ? Number(item.cantidad) : 1
    }));

  guardarCarrito();
}

function actualizarTodo() {
  guardarCarrito();
  actualizarContadorCarrito();
  mostrarCarrito();
}

function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

function actualizarContadorCarrito() {
  const badge = document.getElementById("cart-count");

  if (!badge) return;

  const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);

  badge.innerText = totalItems;
  badge.style.display = totalItems > 0 ? "block" : "none";
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

  if (toastAnterior) toastAnterior.remove();

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
    if (toast) toast.remove();
  }, 2200);
}