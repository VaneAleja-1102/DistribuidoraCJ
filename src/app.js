const express = require('express');
const cors = require('cors');
require('dotenv').config();
const manejarErrores = require('./middlewares/errores.middleware');
const validarApiKey = require('./middlewares/apiKey.middleware');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');

const app = express();
app.use(cors());
app.use(express.json());

// Swagger queda SIN protección, para que puedas ver la documentación sin la key
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// A partir de aquí, TODO lo que empiece con /api exige la key
app.use('/api', validarApiKey);

app.use('/api/categorias', require('./routes/categorias.routes'));
app.use('/api/proveedores', require('./routes/proveedores.routes'));
app.use('/api/productos', require('./routes/productos.routes'));
app.use('/api/ventas', require('./routes/ventas.routes'));
app.use('/api/seguridad', require('./routes/seguridad.routes'));

app.use(manejarErrores);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));