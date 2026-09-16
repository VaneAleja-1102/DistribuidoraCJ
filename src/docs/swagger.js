const swaggerJsdoc = require('swagger-jsdoc');

const opciones = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Sistema Distribuidora CJ',
      version: '1.0.0',
      description: 'API REST para el control de inventario, productos, categorías, proveedores y ventas de la tienda familiar.',
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Servidor local',
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
        },
      },
      schemas: {
        Categoria: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            nombre: { type: 'string', example: 'Aseo' },
            descripcion: { type: 'string', example: 'Productos de limpieza y aseo' },
          },
        },
        Proveedor: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            nombre: { type: 'string', example: 'Distribuidora El Sol' },
            telefono: { type: 'string', example: '3001234567' },
            email: { type: 'string', example: 'contacto@elsol.com' },
          },
        },
        Producto: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            nombre: { type: 'string', example: 'Arroz Diana 500g' },
            precio: { type: 'number', example: 3500 },
            stock: { type: 'integer', example: 50 },
            categoriaId: { type: 'integer', example: 2 },
            proveedorId: { type: 'integer', example: 1 },
          },
        },
        Venta: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            fecha: { type: 'string', format: 'date-time' },
            total: { type: 'number', example: 29500 },
            detalle: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  productoId: { type: 'integer', example: 1 },
                  nombre: { type: 'string', example: 'Arroz Diana 500g' },
                  cantidad: { type: 'integer', example: 3 },
                  precioUnitario: { type: 'number', example: 3500 },
                  subtotal: { type: 'number', example: 10500 },
                },
              },
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            mensaje: { type: 'string', example: 'Recurso no encontrado' },
          },
        },
      },
    },
    security: [
      {
        ApiKeyAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(opciones);

module.exports = swaggerSpec;