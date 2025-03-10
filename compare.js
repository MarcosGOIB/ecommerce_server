const bcrypt = require('bcrypt');

// Contraseña en texto plano que quieres verificar
const plainPassword = 'admin123';

// Hash almacenado en la base de datos (por ejemplo, el hash del admin)
const storedHash = '$2b$10$XW4plBGI93xHgFWjyB7X7.3xHD/dCmbdCYYpj9rZUVLtbQ9mV3iyW';

// Comparar la contraseña con el hash
bcrypt.compare(plainPassword, storedHash, (err, result) => {
    if (err) {
        console.error('Error al comparar:', err);
        return;
    }

    if (result) {
        console.log('La contraseña es correcta.');
    // Aquí puedes permitir el acceso o realizar otras acciones
    } else {
        console.log('La contraseña es incorrecta.');
        // Aquí puedes denegar el acceso
    }
});