// Ejemplo rápido de validación en registro.js
document.getElementById('register-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const pass = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;

    if(pass !== confirm) {
        alert("Las contraseñas no coinciden, checa de nuevo.");
        return;
    }
    
    // Aquí es donde harás el envío a la Raspberry
    alert("¡Datos listos para enviar a la Raspberry!");
});