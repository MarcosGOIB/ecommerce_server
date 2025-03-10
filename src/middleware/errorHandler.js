exports.errorHandler = (err, req, res, next) => {
  console.error('Error:', err.stack);
  console.error('Ruta:', req.path);
  console.error('Método:', req.method);
  console.error('Cuerpo de la solicitud:', req.body);

  // Errores de archivos
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      message: 'Archivo demasiado grande. El tamaño máximo permitido es 5MB.'
    });
  }

  if (err.message === 'No es una imagen. Por favor sube solo imágenes.') {
    return res.status(400).json({
      message: err.message
    });
  }

  // Errores de la base de datos
  if (err.code === '23505') { 
    return res.status(409).json({
      message: 'Ya existe un registro con esa información.'
    });
  }

  if (err.code === '22P02') { 
    return res.status(400).json({
      message: 'Formato de datos inválido.'
    });
  }

  if (err.code === '23503') { 
    return res.status(400).json({
      message: 'No se puede realizar la operación porque referencia datos que no existen.'
    });
  }

  // Errores de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Token inválido. Por favor inicie sesión nuevamente.'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Su sesión ha expirado. Por favor inicie sesión nuevamente.'
    });
  }

  // Error genérico
  res.status(500).json({
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
};
