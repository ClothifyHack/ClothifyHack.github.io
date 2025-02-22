const express = require('express');
const apiController = require('../controllers/apiController');

const router = express.Router();

// Ruta de prueba
router.get('/test', (req, res) => {
    res.json({ message: '¡El backend funciona correctamente!' });
});

// Ruta para la búsqueda visual
router.post('/search', apiController.searchProducts);

module.exports = router;