const express = require('express');
const cors = require('cors');
require('dotenv').config();
const manejarErrores = require('./middlewares/errores.middleware');
const validarApiKey = require('./middlewares/apiKey.middleware');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');
const { consultar } = require('./config/database');

const app = express();
app.use(cors());
app.use(express.json());

// Salud básica (sin API Key): permite comprobar que el servicio está arriba
app.get('/', (req, res) => {
  res.json({ mensaje: 'API Distribuidora CJ funcionando' });
});

// Swagger queda SIN protección, para que puedas ver la documentación sin la key
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Contrato OpenAPI en JSON
app.get('/openapi.json', (req, res) => {
  res.json(swaggerSpec);
});

// A partir de aquí, TODO lo que empiece con /api exige la key
app.use('/api', validarApiKey);

app.use('/api/categorias', require('./routes/categorias.routes'));
app.use('/api/proveedores', require('./routes/proveedores.routes'));
app.use('/api/productos', require('./routes/productos.routes'));
app.use('/api/ventas', require('./routes/ventas.routes'));
app.use('/api/seguridad', require('./routes/seguridad.routes'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/usuarios', require('./routes/usuarios.routes'));
app.use('/api/clientes', require('./routes/clientes.routes'));
app.use('/api/vendedores', require('./routes/vendedores.routes'));

app.use(manejarErrores);

const PORT = process.env.PORT || 3000;

const iniciarServidor = async () => {
    try {
        // Comprobar la base ANTES de abrir el puerto.
        // El administrador inicial ya NO se crea aquí: se crea con  npm run seed:admin
        await consultar('SELECT 1');
        app.listen(PORT, () => {
            console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
            console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
            console.log(`OpenAPI JSON: http://localhost:${PORT}/openapi.json`);
        });
    } catch (error) {
        console.error("Error al iniciar el servidor:", error.message);
        process.exit(1);
    }
};
iniciarServidor();