// ==========================================
// 1. ESTADO GLOBAL Y PERSISTENCIA
// ==========================================
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// ==========================================
// 2. FUNCIONALIDAD DE BÚSQUEDA (FILTRO)
// ==========================================
/**
 * Filtra los productos en el index.html basándose en el título.
 */
function inicializarBuscador() {
    const searchInput = document.getElementById('search-input');
    const productCards = document.querySelectorAll('.item-card');
    const noResults = document.getElementById('no-results');

    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const searchText = e.target.value.toLowerCase();
        let hasVisibleCards = false;

        productCards.forEach(card => {
            const titleText = card.querySelector('.item-title').textContent.toLowerCase();
            const columnWrapper = card.closest('[class*="col-"]');

            if (titleText.includes(searchText)) {
                columnWrapper.classList.remove('d-none');
                hasVisibleCards = true;
            } else {
                columnWrapper.classList.add('d-none');
            }
        });

        // Mostrar u ocultar mensaje de "No hay resultados"
        if (hasVisibleCards) {
            noResults.classList.add('d-none');
        } else {
            noResults.classList.remove('d-none');
        }
    });
}

// ==========================================
// 3. LÓGICA DEL CARRITO (GESTIÓN DE DATOS)
// ==========================================

/**
 * Añade un producto al carrito incluyendo su imagen.
 */
function agregarCarrito(id, nombre, precio, imagen) {
    const productoExistente = carrito.find(item => item.id === id);

    if (productoExistente) {
        productoExistente.cantidad += 1;
    } else {
        carrito.push({
            id: id,
            nombre: nombre,
            precio: parseFloat(precio),
            imagen: imagen,
            cantidad: 1
        });
    }
    actualizarTodo();
    console.log(`Añadido: ${nombre}`);
}

/**
 * Cambia la cantidad usando los botones + y -
 */
function cambiarCantidad(id, cambio) {
    const producto = carrito.find(item => item.id === id);
    if (producto) {
        producto.cantidad += cambio;
        if (producto.cantidad <= 0) {
            eliminarDelCarrito(id);
        } else {
            actualizarTodo();
        }
    }
}

/**
 * Actualiza la cantidad cuando el usuario escribe directamente en el input
 */
function actualizarCantidadManual(id, valor) {
    const nuevaCantidad = parseInt(valor);
    const producto = carrito.find(item => item.id === id);

    if (producto && !isNaN(nuevaCantidad) && nuevaCantidad > 0) {
        producto.cantidad = nuevaCantidad;
    } else if (nuevaCantidad <= 0) {
        eliminarDelCarrito(id);
    }
    actualizarTodo();
}

function eliminarDelCarrito(id) {
    carrito = carrito.filter(item => item.id !== id);
    actualizarTodo();
}

function limpiarCarrito() {
    if (confirm("¿Estás seguro de que quieres vaciar el carrito?")) {
        carrito = [];
        actualizarTodo();
    }
}

// ==========================================
// 4. RENDERIZADO Y UI (INTERFAZ)
// ==========================================

/**
 * Dibuja los productos en la página del carrito y actualiza totales
 */
function mostrarCarrito() {
    const lista = document.getElementById('cart-items');
    const totalElemento = document.getElementById('cart-total');
    const subtotalElemento = document.getElementById('subtotal-val');
    
    if (!lista) return;
    lista.innerHTML = '';
    let sumaTotal = 0;

    if (carrito.length === 0) {
        lista.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-cart-x fs-1 text-muted"></i>
                <p class="mt-3 text-muted">Tu carrito está vacío.</p>
            </div>`;
        if (totalElemento) totalElemento.innerText = '0.00';
        if (subtotalElemento) subtotalElemento.innerText = '$0.00';
        return;
    }

    carrito.forEach((producto) => {
        const subtotal = producto.precio * producto.cantidad;
        sumaTotal += subtotal;

        const li = document.createElement('li');
        li.className = 'list-group-item py-4 border-0 border-bottom';
        li.innerHTML = `
            <div class="d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center">
                    <div class="me-3" style="width: 70px; height: 70px;">
<img src="${producto.imagen}" 
     alt="${producto.nombre}" 
     class="rounded shadow-sm" 
     style="width: 100%; height: 100%; object-fit: cover;"
     onerror="this.src='https://placehold.co/200x200?text=Sin+Imagen'">
                    </div>
                    <div>
                        <h6 class="mb-0 fw-bold">${producto.nombre}</h6>
                        <small class="text-muted">$${producto.precio.toLocaleString()}</small>
                    </div>
                </div>
                
                <div class="d-flex align-items-center">
                    <div class="input-group input-group-sm me-3" style="width: 120px;">
                        <button class="btn btn-outline-secondary" onclick="cambiarCantidad('${producto.id}', -1)">-</button>
                        <input type="number" class="form-control text-center fw-bold" 
                               value="${producto.cantidad}" 
                               onchange="actualizarCantidadManual('${producto.id}', this.value)">
                        <button class="btn btn-outline-secondary" onclick="cambiarCantidad('${producto.id}', 1)">+</button>
                    </div>

                    <span class="fw-bold me-3" style="min-width: 90px; text-align: right;">$${subtotal.toLocaleString()}</span>
                    
                    <button class="btn btn-sm text-danger ms-2" onclick="eliminarDelCarrito('${producto.id}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `;
        lista.appendChild(li);
    });

    // Actualizar números en el resumen de compra
    if (totalElemento) totalElemento.innerText = sumaTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 });
    if (subtotalElemento) subtotalElemento.innerText = `$${sumaTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
}

/**
 * Simulación de cierre de compra
 */
function finalizarCompra() {
    if (carrito.length === 0) return alert("Tu carrito está vacío.");
    alert("¡Pedido realizado con éxito! Gracias por confiar en Gunter.");
    carrito = [];
    actualizarTodo();
    window.location.href = "index.html";
}

// ==========================================
// 5. SINCRONIZACIÓN E INICIALIZACIÓN
// ==========================================

/**
 * Guarda en Storage y refresca todos los componentes visuales
 */
function actualizarTodo() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
    
    // Actualizar el numerito del badge en el header
    const badge = document.getElementById('cart-count');
    if (badge) {
        const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
        badge.innerText = totalItems;
        badge.style.display = totalItems > 0 ? 'block' : 'none';
    }
    
    // Refrescar la lista si estamos en la página del carrito
    mostrarCarrito();
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    actualizarTodo();
    inicializarBuscador();
});