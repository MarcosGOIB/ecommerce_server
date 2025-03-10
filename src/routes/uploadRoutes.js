const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');


console.log("Directorio actual:", __dirname);
const uploadDir = path.join(__dirname, '../public/uploads');
console.log("Directorio de uploads completo:", uploadDir);
console.log("¿La carpeta existe?", fs.existsSync(uploadDir));


if (!fs.existsSync(uploadDir)) {
  console.log("Creando directorio de uploads...");
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("Directorio creado con éxito");
  } catch (error) {
    console.error("Error al crear directorio:", error);
  }
}


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("Guardando archivo en:", uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = uniqueSuffix + ext;
    console.log("Nombre de archivo generado:", filename);
    cb(null, filename);
  }
});



const upload = multer({ storage: storage });


router.post('/', verifyToken, isAdmin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      console.log("No se proporcionó ninguna imagen");
      return res.status(400).json({ message: 'No se proporcionó ninguna imagen' });
    }

    console.log("Archivo recibido:", req.file);
    console.log("Ruta completa del archivo:", req.file.path);

    
    const imageUrl = `/uploads/${req.file.filename}`;
    
    console.log("URL de la imagen que se guarda en BD:", imageUrl);
    
    res.status(201).json({ 
      message: 'Imagen subida con éxito',
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error('Error al subir la imagen:', error);
    res.status(500).json({ message: 'Error al subir la imagen', error: error.message });
  }
});

module.exports = router;