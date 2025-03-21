const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Rutas públicas
router.get('/', productController.getAllProducts);
router.get('/latest', productController.getLatestProducts); // Añadida esta ruta para los últimos productos
router.get('/categories', productController.getAllCategories);
router.get('/category/:categorySlug', productController.getProductsByCategory);
router.get('/brand/:brand', productController.getProductsByBrand);
router.get('/game-type/:gameType', productController.getProductsByGameType);
router.get('/brands', productController.getAllBrands);
router.get('/game-types', productController.getAllGameTypes);
router.get('/:id', productController.getProductById);

// Rutas protegidas (requieren autenticación)
router.post('/', verifyToken, isAdmin, productController.createProduct);
router.put('/:id', verifyToken, isAdmin, productController.updateProduct);
router.delete('/:id', verifyToken, isAdmin, productController.deleteProduct);

module.exports = router;
