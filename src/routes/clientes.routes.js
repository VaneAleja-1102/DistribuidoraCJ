const { Router } = require('express');
const router = Router();
const autenticarJWT = require('../middlewares/auth.middleware');
const autorizarRoles = require('../middlewares/roles.middleware');
const validar = require('../middlewares/validar.middleware');
const clientesController = require('../controllers/clientes.controller');
const {
  validarCliente,
  validarClienteParcial,
  validarIdCliente,
} = require('../middlewares/clientes.validator');

// Política RBAC:
//   GET            → administrador, vendedor (el vendedor necesita consultar clientes para vender)
//   POST/PUT/PATCH/DELETE → administrador
// El rol cliente NO lista la colección completa: solo accede a lo suyo (ver /ventas/mis-ventas).

/**
 * @swagger
 * components:
 *   schemas:
 *     ClienteEntrada:
 *       type: object
 *       required: [nombre, documento]
 *       properties:
 *         usuarioId:
 *           type: integer
 *           nullable: true
 *           example: 2
 *         nombre:
 *           type: string
 *           example: Cliente A
 *         documento:
 *           type: string
 *           example: "1000000001"
 *         email:
 *           type: string
 *           example: cliente.a@tiendacj.com
 *         telefono:
 *           type: string
 *           example: "3001234567"
 *         direccion:
 *           type: string
 *           example: Calle 5 # 10-20
 */

/**
 * @swagger
 * /clientes:
 *   get:
 *     tags: [Clientes]
 *     summary: Listar clientes
 *     security:
 *       - ApiKeyAuth: []
 *         BearerAuth: []
 *     responses:
 *       200: { description: Lista de clientes }
 *       401: { description: Credenciales de autenticación ausentes o inválidas }
 *       403: { description: Usuario sin permisos para realizar la operación }
 */
router.get('/', autenticarJWT, autorizarRoles('administrador', 'vendedor'), clientesController.listar);

/**
 * @swagger
 * /clientes/{id}:
 *   get:
 *     tags: [Clientes]
 *     summary: Obtener cliente por id
 *     security:
 *       - ApiKeyAuth: []
 *         BearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Cliente encontrado }
 *       401: { description: Credenciales de autenticación ausentes o inválidas }
 *       403: { description: Usuario sin permisos para realizar la operación }
 *       404: { description: Cliente no encontrado }
 */
router.get('/:id', autenticarJWT, autorizarRoles('administrador', 'vendedor'), validarIdCliente, validar, clientesController.obtener);

/**
 * @swagger
 * /clientes:
 *   post:
 *     tags: [Clientes]
 *     summary: Crear cliente (opcionalmente asociado a un usuario con rol cliente)
 *     security:
 *       - ApiKeyAuth: []
 *         BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ClienteEntrada' }
 *     responses:
 *       201: { description: Cliente creado }
 *       400: { description: Datos inválidos o usuario asociado inexistente }
 *       401: { description: Credenciales de autenticación ausentes o inválidas }
 *       403: { description: Usuario sin permisos para realizar la operación }
 *       409: { description: Usuario sin rol cliente o ya asociado a otro cliente }
 */
router.post('/', autenticarJWT, autorizarRoles('administrador'), validarCliente, validar, clientesController.crear);

/**
 * @swagger
 * /clientes/{id}:
 *   put:
 *     tags: [Clientes]
 *     summary: Reemplazar cliente
 *     security:
 *       - ApiKeyAuth: []
 *         BearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ClienteEntrada' }
 *     responses:
 *       200: { description: Cliente actualizado }
 *       400: { description: Datos inválidos }
 *       401: { description: Credenciales de autenticación ausentes o inválidas }
 *       403: { description: Usuario sin permisos para realizar la operación }
 *       404: { description: Cliente no encontrado }
 *       409: { description: Conflicto de asociación usuario–cliente }
 *   patch:
 *     tags: [Clientes]
 *     summary: Actualizar parcialmente un cliente
 *     security:
 *       - ApiKeyAuth: []
 *         BearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ClienteEntrada' }
 *     responses:
 *       200: { description: Cliente actualizado }
 *       400: { description: Datos inválidos }
 *       401: { description: Credenciales de autenticación ausentes o inválidas }
 *       403: { description: Usuario sin permisos para realizar la operación }
 *       404: { description: Cliente no encontrado }
 *       409: { description: Conflicto de asociación usuario–cliente }
 *   delete:
 *     tags: [Clientes]
 *     summary: Eliminar cliente
 *     security:
 *       - ApiKeyAuth: []
 *         BearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Cliente eliminado }
 *       401: { description: Credenciales de autenticación ausentes o inválidas }
 *       403: { description: Usuario sin permisos para realizar la operación }
 *       404: { description: Cliente no encontrado }
 *       409: { description: El cliente tiene ventas asociadas }
 */
router.put('/:id', autenticarJWT, autorizarRoles('administrador'), validarIdCliente, validarCliente, validar, clientesController.actualizar);
router.patch('/:id', autenticarJWT, autorizarRoles('administrador'), validarIdCliente, validarClienteParcial, validar, clientesController.actualizarParcial);
router.delete('/:id', autenticarJWT, autorizarRoles('administrador'), validarIdCliente, validar, clientesController.eliminar);

module.exports = router;