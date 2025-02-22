const validateImage = (image) => {
    // Verifica que la imagen sea válida (base64 o formato específico)
    return image && image.startsWith('data:image');
};
/**
 * Transforma una lista de productos en código HTML.
 * @param {Array} products - Lista de productos.
 * @returns {string} - Código HTML para mostrar los productos.
 */
function transformProductsToHTML(products) {
    if (!products || products.length === 0) {
        return `<p>No se encontraron productos.</p>`;
    }

    // Genera una tarjeta para cada producto
    const productCards = products.map((product) => `
    <div class="product-card">
      <h2>${product.name}</h2>
      <img src="${product.imageUrl || 'https://via.placeholder.com/200'}" alt="${product.name}" />
      <p><strong>Precio:</strong> ${product.price.value.current} ${product.price.currency}</p>
      <a href="${product.link}" target="_blank">Ver producto</a>
    </div>
  `).join("");

    // Envuelve las tarjetas en un contenedor
    return `
    <div class="product-container">
      ${productCards}
    </div>
  `;
}

module.exports = {
    validateImage,
    transformProductsToHTML,
};