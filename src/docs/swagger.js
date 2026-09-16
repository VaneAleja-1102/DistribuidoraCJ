const swaggerJsdoc = require('swagger-jsdoc');

const opciones = {
  definition: {
    openapi: '3.0.0',

    info: {
      title: 'API Sistema Distribuidora CJ',
      version: '1.0.0',
      description:
        'API REST para el control de inventario, productos, categorías, proveedores y ventas de la tienda familiar.',
    },

    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Servidor local',
      },
    ],

    components: {
      schemas: {

        Categoria: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            nombre: {
              type: 'string',
              example: 'Pinturas',
            },
            descripcion: {
              type: 'string',
              example: 'Productos de pinturas',
            },
          },
        },

        Proveedor: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            nombre: {
              type: 'string',
              example: 'Pintuco',
            },
            telefono: {
              type: 'string',
              example: '3001234567',
            },
            email: {
              type: 'string',
              example: 'pintuco@gmail.com',
            },
          },
        },

        Producto: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            nombre: {
              type: 'string',
              example: 'Caneca pintura',
            },
            precio: {
              type: 'number',
              example: 250000,
            },
            stock: {
              type: 'integer',
              example: 10,
            },
            categoriaId: {
              type: 'integer',
              example: 1,
            },
            proveedorId: {
              type: 'integer',
              example: 1,
            },
          },
        },

        Venta: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            fecha: {
              type: 'string',
              format: 'date-time',
              example: '2026-09-15T10:30:00.000Z',
            },
            total: {
              type: 'number',
              example: 255000,
            },
            detalle: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  productoId: {
                    type: 'integer',
                    example: 1,
                  },
                  nombre: {
                    type: 'string',
                    example: 'Caneca pintura',
                  },
                  cantidad: {
                    type: 'integer',
                    example: 1,
                  },
                  precioUnitario: {
                    type: 'number',
                    example: 250000,
                  },
                  subtotal: {
                    type: 'number',
                    example: 250000,
                  },
                },
              },
            },
          },
        },

        Error: {
          type: 'object',
          properties: {
            mensaje: {
              type: 'string',
              example: 'Recurso no encontrado',
            },
          },
        },
      },
    },
  },

  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(opciones);

module.exports = swaggerSpec;