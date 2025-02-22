// Función para mostrar el formulario de búsqueda
function showForm() {
    document.querySelector('.welcome-tab').style.display = 'none';
    document.getElementById('searchForm').style.display = 'block';
}

// Manejo del formulario
document.getElementById('orderForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    const orderId = document.getElementById('orderId').value;

    // Validación básica del orderId
    if (!orderId) {
        alert('Por favor, introduce un ID de pedido.');
        return;
    }

    // Validación de longitud del orderId
    if (orderId.length !== 11) {
        alert('El ID del pedido debe tener exactamente 11 caracteres.');
        return;
    }

    try {
        console.log(`🔄 Realizando solicitud para Order ID: ${orderId}`);
        const response = await fetch(`http://localhost:3001/api/order-status/${orderId}`);

        // Verifica si la respuesta es OK (código 200-299)
        if (!response.ok) {
            // Intenta obtener el mensaje de error del backend
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al obtener los detalles del pedido.');
        }

        // Parsea la respuesta JSON
        const data = await response.json();
        console.log('✅ Respuesta recibida:', data);

        // Muestra los detalles del pedido
        displayOrderDetails(data);
    } catch (error) {
        console.error('Error:', error);

        // Muestra un mensaje de error al usuario
        if (error.message === 'Failed to fetch') {
            alert('No se pudo conectar con el servidor. Verifica tu conexión a internet o que el servidor esté en funcionamiento.');
        } else {
            alert(error.message);
        }
    }
});

// Función para mostrar los detalles del pedido
function displayOrderDetails(order) {
    const orderDetails = document.getElementById('orderDetails');
    orderDetails.innerHTML = '';

    // Verifica si el objeto order tiene los datos esperados
    if (!order || !order.id || !order.status || !order.trackings) {
        orderDetails.textContent = 'No se encontraron datos válidos para el pedido.';
        return;
    }

    // Muestra el ID del pedido
    const orderId = document.createElement('h2');
    orderId.textContent = `Pedido ID: ${order.id}`;
    orderDetails.appendChild(orderId);

    // Muestra el estado del pedido
    const status = document.createElement('p');
    status.textContent = `Estado: ${order.status.summary} (${new Date(order.status.dateTime).toLocaleString()})`;
    orderDetails.appendChild(status);

    // Muestra los seguimientos
    const trackingsTitle = document.createElement('h3');
    trackingsTitle.textContent = 'Seguimientos:';
    orderDetails.appendChild(trackingsTitle);

    const trackingsList = document.createElement('ul');
    order.trackings.forEach(tracking => {
        const trackingItem = document.createElement('li');
        trackingItem.innerHTML = `
            <strong>Tracking ID:</strong> ${tracking.trackingId}<br>
            <strong>Estado:</strong> ${tracking.status.summary} (${new Date(tracking.status.dateTime).toLocaleString()})<br>
            <strong>Historial:</strong>
            <ul>
                ${tracking.history.map(event => `
                    <li>${event.summary} (${new Date(event.dateTime).toLocaleString()})</li>
                `).join('')}
            </ul>
        `;
        trackingsList.appendChild(trackingItem);
    });
    orderDetails.appendChild(trackingsList);
}