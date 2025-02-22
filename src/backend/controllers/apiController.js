const axios = require('axios');
const authService = require('../services/authService');

const searchProducts = async (req, res) => {
    const { image } = req.body; // La imagen en base64

    try {
        const token = await authService.getAccessToken();

        if (!token) {
            return res.status(500).json({ error: 'Error al obtener el token' });
        }

        const response = await axios.post('https://api.inditex.com/visual-search', {
            image: image,
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        res.json(response.data); // Devuelve los productos
    } catch (error) {
        console.error('Error en la búsqueda:', error);
        res.status(500).json({ error: 'Error en la búsqueda' });
    }
};
const {
    searchSimilarProducts,
    searchProductsByQuery,
} = require("../services/inditexService");
const { transformProductsToHTML } = require("../utils/htmlUtils");

/**
 * Controlador para buscar productos similares a una imagen.
 * @param {object} req - Objeto de solicitud HTTP.
 * @param {object} res - Objeto de respuesta HTTP.
 */
async function searchByImage(req, res) {
    const { imageUrl, page, perPage } = req.query;
    try {
        const products = await searchSimilarProducts(imageUrl, page, perPage);
        const html = transformProductsToHTML(products);
        res.status(200).send(html);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

/**
 * Controlador para buscar productos por palabras clave.
 * @param {object} req - Objeto de solicitud HTTP.
 * @param {object} res - Objeto de respuesta HTTP.
 */
async function searchByQuery(req, res) {
    const { query, brand, page, perPage } = req.query;
    try {
        const products = await searchProductsByQuery(query, brand, page, perPage);
        const html = transformProductsToHTML(products);
        res.status(200).send(html);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    searchProducts,
    searchByImage,
    searchByQuery,
};