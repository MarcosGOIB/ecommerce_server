const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const db = require('../config/database');

exports.getAllProducts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    const products = await Product.findAll(limit, offset);
    res.json({ products: products || [] });
  } catch (error) {
    console.error('Error al obtener todos los productos:', error);
    next(error);
  }
};

exports.getLatestProducts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const products = await Product.findAll(limit, 0);
    res.json({ products: products || [] });
  } catch (error) {
    console.error('Error al obtener productos recientes:', error);
    next(error);
  }
};

exports.getProductsByCategory = async (req, res, next) => {
  try {
    const { categorySlug } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    const category = await Category.findBySlug(categorySlug);
    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    
    const products = await Product.findByCategory(categorySlug, limit, offset);
    res.json({ 
      category,
      products: products || [] 
    });
  } catch (error) {
    console.error('Error al obtener productos por categoría:', error);
    next(error);
  }
};

exports.getProductsByBrand = async (req, res, next) => {
  try {
    const { brand } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    const products = await Product.findByBrand(brand, limit, offset);
    res.json({ 
      brand,
      products: products || [] 
    });
  } catch (error) {
    console.error('Error al obtener productos por marca:', error);
    next(error);
  }
};

exports.getProductsByGameType = async (req, res, next) => {
  try {
    const { gameType } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    const products = await Product.findByGameType(gameType, limit, offset);
    res.json({ 
      gameType,
      products: products || [] 
    });
  } catch (error) {
    console.error('Error al obtener productos por tipo de juego:', error);
    next(error);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const productId = req.params.id;
    
    // Caso especial para "latest"
    if (productId === 'latest') {
      const limit = parseInt(req.query.limit) || 6;
      const products = await Product.findAll(limit, 0);
      return res.json({ products: products || [] });
    }
    
    // Verificar que el ID sea un número
    if (isNaN(productId)) {
      return res.status(400).json({ message: 'ID de producto inválido' });
    }
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    res.json({ product });
  } catch (error) {
    console.error('Error al obtener producto por ID:', error);
    next(error);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const { 
      name, 
      price, 
      quantity, 
      short_description, 
      full_description, 
      image_url, 
      category_id,
      brand,
      game_type
    } = req.body;

    console.log("Datos recibidos para crear producto:", req.body);
    
    // Validación básica
    if (!name || !price || quantity === undefined || !short_description || !category_id) {
      return res.status(400).json({ 
        message: 'Los campos obligatorios son: nombre, precio, cantidad, descripción corta y categoría' 
      });
    }

    // Validación de existencia de categoría
    const category = await Category.findById(category_id);
    if (!category) {
      return res.status(400).json({ message: 'La categoría seleccionada no existe' });
    }

    const categoryName = category.name.toLowerCase();
    if (categoryName === 'accesorios' && !brand) {
      return res.status(400).json({ message: 'Para accesorios, la marca es requerida' });
    }
    
    if ((categoryName === 'juegos de cartas' || categoryName === 'singles') && !game_type) {
      return res.status(400).json({ message: 'Para juegos de cartas o singles, el tipo de juego es requerido' });
    }

    // Asegúrate de que los tipos de datos sean correctos
    const formattedData = {
      name,
      price: parseFloat(price),
      quantity: parseInt(quantity, 10),
      short_description,
      full_description: full_description || short_description, // Valor por defecto si es vacío
      image_url,
      category_id,
      brand: categoryName === 'accesorios' ? brand : null,
      game_type: (categoryName === 'juegos de cartas' || categoryName === 'singles') ? game_type : null
    };

    const newProduct = await Product.create(formattedData);

    res.status(201).json({
      message: 'Producto creado exitosamente',
      product: newProduct
    });
  } catch (error) {
    console.error('Error al crear producto:', error);
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const { 
      name, 
      price, 
      quantity, 
      short_description, 
      full_description, 
      image_url, 
      category_id,
      brand,
      game_type 
    } = req.body;
    
    const productId = req.params.id;

    console.log("Datos recibidos para actualizar producto:", req.body);

    // Verificar que el ID sea un número
    if (isNaN(productId)) {
      return res.status(400).json({ message: 'ID de producto inválido' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    let categoryName;
    if (category_id) {
      const category = await Category.findById(category_id);
      if (!category) {
        return res.status(400).json({ message: 'La categoría seleccionada no existe' });
      }
      categoryName = category.name.toLowerCase();
    } else if (product.category_name) {
      categoryName = product.category_name.toLowerCase();
    }

    if (categoryName === 'accesorios' && brand === '') {
      return res.status(400).json({ message: 'Para accesorios, la marca es requerida' });
    }
    
    if ((categoryName === 'juegos de cartas' || categoryName === 'singles') && game_type === '') {
      return res.status(400).json({ message: 'Para juegos de cartas o singles, el tipo de juego es requerido' });
    }

    // Preparar los datos para actualizar, asegurándose de que son del tipo correcto
    const updateData = {
      name,
      price: price !== undefined ? parseFloat(price) : undefined,
      quantity: quantity !== undefined ? parseInt(quantity, 10) : undefined,
      short_description,
      full_description,
      image_url,
      category_id,
      brand,
      game_type
    };

    const updatedProduct = await Product.update(productId, updateData);

    res.json({
      message: 'Producto actualizado exitosamente',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    
    // Verificar que el ID sea un número
    if (isNaN(productId)) {
      return res.status(400).json({ message: 'ID de producto inválido' });
    }
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    await Product.delete(productId);
    
    res.json({
      message: 'Producto eliminado exitosamente',
      id: productId
    });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    next(error);
  }
};

exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll();
    res.json({ categories: categories || [] });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    next(error);
  }
};

exports.getAllBrands = async (req, res, next) => {
  try {
    const brands = await Product.findAllBrands();
    res.json({ brands: brands || [] });
  } catch (error) {
    console.error('Error al obtener marcas:', error);
    next(error);
  }
};

exports.getAllGameTypes = async (req, res, next) => {
  try {
    const gameTypes = await Product.findAllGameTypes();
    res.json({ gameTypes: gameTypes || [] });
  } catch (error) {
    console.error('Error al obtener tipos de juego:', error);
    next(error);
  }
};
