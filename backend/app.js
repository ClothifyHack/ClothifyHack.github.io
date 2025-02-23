require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Importa cors
const axios = require('axios');
const app = express();
const PORT = 3001;

// Habilita CORS
app.use(cors());
app.use(express.json());

// Configuración de credenciales y URLs
const {
    CLIENT_ID = 'oauth-mkpsbox-oauthlzjswhdwdfzchfeazqsnbxpro',
    CLIENT_SECRET = 'gpJ[eN67T16{4FTG',
    AUTH_URL = 'https://auth.inditex.com/openam/oauth2/itxid/itxidmp/sandbox/access_token',
    API_BASE_URL = 'https://api-sandbox.inditex.com/pubordtrck-sandbox/lefties/orders',
    VISUAL_SEARCH_API_URL = 'https://api-sandbox.inditex.com/pubvsearch-sandbox/products'
} = process.env;

// Función para obtener el token de acceso para la API de pedidos
async function getToken() {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('scope', 'technology.orders.read');

    try {
        const response = await axios.post(AUTH_URL, params, {
            auth: {
                username: CLIENT_ID,
                password: CLIENT_SECRET,
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        console.log('✅ Token obtenido correctamente.');
        return response.data.id_token;
    } catch (error) {
        console.error('❌ Error al obtener el token:', error.response ? error.response.data : error.message);
        throw new Error('No se pudo obtener el token de acceso.');
    }
}

// Función para obtener el token de acceso para la API de búsqueda visual
async function getTokenVisual() {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('scope', 'technology.catalog.read'); // Scope para la API de búsqueda visual

    try {
        const response = await axios.post(AUTH_URL, params, {
            auth: {
                username: CLIENT_ID,
                password: CLIENT_SECRET,
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        console.log('✅ Token obtenido correctamente para la API de búsqueda visual.');
        return response.data.id_token;
    } catch (error) {
        console.error('❌ Error al obtener el token para la API de búsqueda visual:', error.response ? error.response.data : error.message);
        throw new Error('No se pudo obtener el token de acceso para la API de búsqueda visual.');
    }
}

// Función para obtener los detalles de un pedido
async function getOrder(orderId, token) {
    if (orderId.length !== 11) {
        console.error(`❌ Error: El ID del pedido "${orderId}" no tiene 11 caracteres.`);
        throw new Error("El ID del pedido debe tener exactamente 11 caracteres.");
    }

    const url = `${API_BASE_URL}/${orderId}`;
    const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    try {
        console.log(`📡 Solicitando datos para Order ID: ${orderId}`);
        const response = await axios.get(url, { headers });

        console.log("✅ Respuesta de la API recibida correctamente.");
        console.log("📦 JSON recibido de la API:", JSON.stringify(response.data, null, 2));

        return response.data;
    } catch (error) {
        console.error('❌ Error en la solicitud a la API:', error.response ? error.response.data : error.message);
        throw new Error('No se pudo obtener la información del pedido.');
    }
}

// Función para buscar productos basados en una imagen
async function searchProductsByImage(imageUrl, token) {
    const url = `${VISUAL_SEARCH_API_URL}?image=${encodeURIComponent(imageUrl)}`;
    const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    try {
        console.log(`📡 Solicitando productos para la imagen: ${imageUrl}`);
        const response = await axios.get(url, { headers });

        console.log("✅ Respuesta de la API de búsqueda visual recibida correctamente.");
        console.log("📦 JSON recibido de la API:", JSON.stringify(response.data, null, 2));

        return response.data;
    } catch (error) {
        console.error('❌ Error en la solicitud a la API de búsqueda visual:', error.response ? error.response.data : error.message);
        throw new Error('No se pudo obtener la información de los productos.');
    }
}

// Endpoint para obtener el estado de un pedido
app.get('/api/order-status/:orderId', async (req, res) => {
    const { orderId } = req.params;

    if (!orderId) {
        return res.status(400).json({ error: 'El ID del pedido es requerido.' });
    }

    try {
        const token = await getToken();
        const orderData = await getOrder(orderId, token);
        res.json(orderData); // Envía la respuesta en formato JSON
    } catch (error) {
        console.error('❌ Error en el endpoint:', error.message);
        res.status(500).json({ error: error.message }); // Envía errores en formato JSON
    }
});

// Endpoint para buscar productos basados en la URL de la imagen
app.post('/buscar-productos', async (req, res) => {
    const { imageUrl } = req.body;

    if (!imageUrl) {
        return res.status(400).json({ error: 'La URL de la imagen es requerida.' });
    }

    try {
        const token = await getTokenVisual(); // Obtén el token para la API de búsqueda visual
        const productos = await searchProductsByImage(imageUrl, token); // Busca productos usando la API de búsqueda visual
        res.json(productos); // Envía la respuesta en formato JSON
    } catch (error) {
        console.error('❌ Error al buscar productos:', error.message);
        res.status(500).json({ error: 'Ocurrió un error al buscar productos.' });
    }
});

// Middleware para manejar errores no controlados
app.use((err, req, res, next) => {
    console.error('❌ Error no controlado:', err);
    res.status(500).json({ error: 'Ocurrió un error en el servidor.' });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
