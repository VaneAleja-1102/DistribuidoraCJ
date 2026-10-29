const { Router } = require('express');
const router = Router();

const autenticarJWT = require('../middlewares/auth.middleware');
const autorizarRoles = require('../middlewares/roles.middleware');
const validar = require('../middlewares/validar.middleware');
const ventasController = require('../controllers/ventas.controller');
const {
  crearVentaValidator,
  idValidator,
  estadoValidator,
} = require('../middlewares/ventas.validator');
const { validarClienteIdParam } = require('../middlewares/clientes.validator');
const { validarVendedorIdParam } = require('../middlewares/vendedores.validator');
const {
  autorizarClientePropio,
  autorizarVendedorPropio,
  autorizarAccesoVenta,
} = require('../middlewares/propiedad.middleware');

// Flujo en cada ruta:
//   autenticarJWT → autorizarRoles (RBAC) → validator → validar → propiedad (BOLA) → controller
//
// ⚠️ Las rutas fijas (/mis-ventas, /cliente/..., /vendedor/...) van ANTES de /:id

/**
 * @swagger
 * /ventas:
 *   get:
 *     summary: Listar todas las ventas (solo administrador)
 *     tags: [Ventas]
 *     security:
 *       - ApiKeyAuth: []
 *         BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de ventas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Venta'
 *       401: { description: Credenciales de autenticación ausentes o inválidas }
 *       403: { description: Usuario sin permisos para realizar la operación }
 */
router.get('/', autenticarJWT, autorizarRoles('administrador'), ventasController.listar);

/**
 * @swagger
 * /ventas/mis-ventas:
 *   get:
 *     summary: Ventas del usuario autenticado (cliente o vendedor)
 *     description: La identidad se deriva del JWT; no recibe ningún id por URL.
 *     tags: [Ventas]
 *     security:
 *       - ApiKeyAuth: []
 *         BearerAuth: []
 *     responses:
 *       200: { description: Ventas propias }
 *       401: { description: Credenciales de autenticación ausentes o inválidas }
 *       403: { description: Rol no permitido o usuario sin perfil asociado }
 */
router.get('/mis-ventas', autenticarJWT, autorizarRoles('cliente', 'vendedor'), ventasController.misVentas);

/**
 * @swagger
 * /ventas/cliente/{clienteId}:
 *   get:
 *     summary: Ventas de un cliente (administrador o el propio cliente)
 *     tags: [Ventas]
 *     security:
 *       - ApiKeyAuth: []
 *         BearerAuth: []
 *     parameters:
 *       - { in: path, name: clienteId, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Ventas del cliente }
 *       400: { description: Identificador inválido }
 *       401: { description: Credenciales de autenticación ausentes o inválidas }
 *       403: { description: El recurso no pertenece al usuario autenticado }
 */
router.get(
  '/cliente/:clienteId',
  autenticarJWT,
  autorizarRoles('administrador', 'cliente'),
  validarClienteIdParam,
  validar,
  autorizarClientePropio,
  ventasController.listarPorCliente
);

/**
 * @swagger
 * /ventas/vendedor/{vendedorId}:
 *   get:
 *     summary: Ventas de un vendedor (administrador o el propio vendedor)
 *     tags: [Ventas]
 *     security:
 *       - ApiKeyAuth: []
 *         BearerAuth: []
 *     parameters:
 *       - { in: path, name: vendedorId, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Ventas del vendedor }
 *       400: { description: Identificador inválido }
 *       401: { description: Credenciales de autenticación ausentes o inválidas }
 *       403: { description: El recurso no pertenece al usuario autenticado }
 */
router.get(
  '/vendedor/:vendedorId',
  autenticarJWT,
  autorizarRoles('administrador', 'vendedor'),
  validarVendedorIdParam,
  validar,
  autorizarVendedorPropio,
  ventasController.listarPorVendedor
);

/**
 * @swagger
 * /ventas/{id}:
 *   get:
 *     summary: Obtener una venta por id (con control de propiedad)
 *     tags: [Ventas]
 *     security:
 *       - ApiKeyAuth: []
 *         BearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Venta encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Venta'
 *       401: { description: Credenciales de autenticación ausentes o inválidas }
 *       403: { description: La venta no pertenece al usuario autenticado }
 *       404: { description: Venta no encontrada }
 *   delete:
 *     summary: Eliminar una venta (solo administrador)
 *     tags: [Ventas]
 *     security:
 *       - ApiKeyAuth: []
 *         BearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Venta eliminada }
 *       401: { description: Credenciales de autenticación ausentes o inválidas }
 *       403: { description: Usuario sin permisos para realizar la operación }
 *       404: { description: Venta no encontrada }
 */
router.get(
  '/:id',
  autenticarJWT,
  autorizarRoles('administrador', 'vendedor', 'cliente'),
  idValidator,
  validar,
  autorizarAccesoVenta,
  ventasController.obtener
);
router.delete('/:id', autenticarJWT, autorizarRoles('administrador'), idValidator, validar, ventasController.eliminar);

/**
 * @swagger
 * /ventas:
 *   post:
 *     summary: Registrar una venta (administrador o vendedor)
 *     description: >
 *       Si quien registra es un vendedor, el servidor asigna su propio vendedorId
 *       (ignora el del body). El administrador debe enviar vendedorId.
 *     tags: [Ventas]
 *     security:
 *       - ApiKeyAuth: []
 *         BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [clienteId, detalle]
 *             properties:
 *               clienteId:
 *                 type: integer
 *                 example: 4
 *               vendedorId:
 *                 type: integer
 *                 example: 3
 *               detalle:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [productoId, cantidad]
 *                   properties:
 *                     productoId: { type: integer, example: 1 }
 *                     cantidad: { type: integer, example: 1 }
 *     responses:
 *       201: { description: Venta registrada, stock descontado y total calculado }
 *       400: { description: Stock insuficiente o datos inválidos }
 *       401: { description: Credenciales de autenticación ausentes o inválidas }
 *       403: { description: Usuario sin permisos o sin perfil de vendedor asociado }
 */
router.post(
  '/',
  autenticarJWT,
  autorizarRoles('administrador', 'vendedor'),
  crearVentaValidator,
  validar,
  ventasController.crear
);

/**
 * @swagger
 * /ventas/{id}/estado:
 *   patch:
 *     summary: Cambiar el estado de una venta (solo administrador)
 *     description: "Transiciones válidas: registrada → pagada | anulada; pagada → entregada | anulada."
 *     tags: [Ventas]
 *     security:
 *       - ApiKeyAuth: []
 *         BearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [estado]
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [registrada, pagada, entregada, anulada]
 *                 example: pagada
 *     responses:
 *       200: { description: Estado actualizado }
 *       400: { description: Estado inválido }
 *       401: { description: Credenciales de autenticación ausentes o inválidas }
 *       403: { description: Usuario sin permisos para realizar la operación }
 *       404: { description: Venta no encontrada }
 *       409: { description: Transición de estado no permitida }
 */
router.patch(
  '/:id/estado',
  autenticarJWT,
  autorizarRoles('administrador'),
  idValidator,
  estadoValidator,
  validar,
  ventasController.cambiarEstado
);

module.exports = router;