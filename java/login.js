// login.js
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const datos = {
        email: document.getElementById('email').value,
        pass: document.getElementById('password').value
    };

    try {
        // PATRÓN ACTUALIZADO: Usamos tu IP fija de la Raspberry y el archivo PHP real
        const respuesta = await fetch('http://192.168.137.2/login.php', {
            method: 'POST',
            body: JSON.stringify(datos),
            headers: { 'Content-Type': 'application/json' }
        });

        // Verificamos si la respuesta es válida antes de intentar leer el JSON
        if (!respuesta.ok) throw new Error("Error en la respuesta del servidor");

        const resultado = await respuesta.json();
        
        if (resultado.success) {
            alert("¡Bienvenido, Paul!"); // Personalizado para ti
            // MECANISMO DINÁMICO: Redirigimos a la versión PHP de la tienda
            window.location.href = "index.php";
        } else {
            alert("Usuario o contraseña incorrectos en MariaDB.");
        }
    } catch (error) {
        console.error("Error conectando a la Raspberry:", error);
        alert("No se pudo conectar con la base de datos. Verifica que la Raspberry esté encendida.");
    }
});