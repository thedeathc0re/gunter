function comprar(nombreProducto) {
    alert('Has seleccionado "' + nombreProducto + '". ¡Gracias por tu interés!');
  }
  mostrarCarrito();
  function agregarCarrito(nombre, precio) {
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  carrito.push({ nombre, precio });
  localStorage.setItem('carrito', JSON.stringify(carrito));
  actualizarContador();
  alert('Producto agregado al carrito');
}

function mostrarCarrito() {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const lista = document.getElementById('cart-items');
  const total = document.getElementById('cart-total');
  let suma = 0;

  carrito.forEach(item => {
    const li = document.createElement('li');
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `${item.nombre} <span>$${item.precio} MXN</span>`;
    lista.appendChild(li);
    suma += item.precio;
  });

  total.innerText = suma.toFixed(2);
}

function actualizarContador() {
  const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
  const contador = document.getElementById('cart-count');
  if (contador) contador.innerText = carrito.length;
}

window.onload = actualizarContador;
function limpiarCarrito() {
  localStorage.removeItem('carrito');
  mostrarCarrito();
}