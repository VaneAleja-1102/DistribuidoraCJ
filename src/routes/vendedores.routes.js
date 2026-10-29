const { Router } = require('express');
const router = Router();
const autenticarJWT = require('../middlewares/auth.middleware');
const autorizarRoles = require('../middlewares/roles.middleware');
const validar = require('../middlewares/validar.middleware');
const vendedoresController = require('../controllers/vendedores.controller');
const {
  validarVendedor,
  validarVendedorParcial,
  validarIdVendedor,
} = require('../middlewares/vendedores.validator');

// Política RBAC:
//   GET            → administrador, vendedor, cliente
//   POST/PUT/PATCH/DELETE → administrador

/**
 * @swagger
 * components:
 *   schemas:
 *     VendedorEntrada:
 *       type: object
 *       required: [nombre, documento]
 *       properties:
 *         usuarioId:
 *           type: integer
 *           nullable: true
 *           example: 4
 *         nombre:
 *           type: string
 *           example: Vendedor A
 *         documento:
 *           type: string
 *           example: "1020300001"
 *         telefono:
 *           type: string
 *           example: "3101234567"
 *         activo:
 *           type: boolean
 *           example: true
 */

/**
 * @swagger
 * /vendedores:
 *   get:
 *     tags: [Vendedores]
 *     summary: Listar vendedores
 *     security:
 *       - ApiKeyAuth: []
 *         BearerAuth: []
 *     responses:
 *       200: { description: Lista de vendedores }
 *       401: { description: Credenciales de autenticación ausentes o inválidas }
 *       403: { description: Usuario sin permisos para realizar la operación }
 *   post:
 *     tags: [Vendedores]
 *     summary: Crear vendedor (opcionalmente asociado a un usuario con rol vendedor)
 *     security:
 *       - ApiKeyAuth: []
 *         BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/VendedorEntrada' }
 *     responses:
 *       201: { description: Vendedor creado }
 *       400: { description: Datos inválidos o usuario asociado inexistente }
 *       401: { description: Credenciales de autenticación ausentes o inválidas }
 *       403: { description: Usuario sin permisos para realizar la operación }
 *       409: { description: Usuario sin rol vendedor o ya asociado a otro vendedor }
 */
router.get('/', autenticarJWT, autorizarRoles('administrador', 'vendedor', 'cliente'), vendedoresController.listar);
router.post('/', autenticarJWT, autorizarRoles('administrador'), validarVendedor, validar, vendedoresController.crear);

/**
 * @swagger
 * /vendedores/{id}:
 *   get:
 *     tags: [Vendedores]
 *     summary: Obtener vendedor por id
 *     security:
 *       - ApiKeyAuth: []
 *         BearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Vendedor encontrado }
 *       401: { description: Credenciales de autenticación ausentes o inválidas }
 *       403: { description: Usuario sin permisos para realizar la operación }
 *       404: { description: Vendedor no encontrado }
 *   put:
 *     tags: [Vendedores]
 *     summary: Reemplazar vendedor
 *     security:
 *       - ApiKeyAuth: []
 *         BearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/VendedorEntrada' }
 *     responses:
 *       200: { description: Vendedor actualizado }
 *       400: { description: Datos inválidos }
 *       401: { description: Credenciales de autenticación ausentes o inválidas }
 *       403: { description: Usuario sin permisos para realizar la operación }
 *       404: { description: Vendedor no encontrado }
 *       409: { description: Conflicto de asociación usuario–vendedor }
 *   patch:
 *     tags: [Vendedores]
 *     summary: Actualizar parcialmente un vendedor
 *     security:
 *       - ApiKeyAuth: []
 *         BearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/VendedorEntrada' }
 *     responses:
 *       200: { description: Vendedor actualizado }
 *       400: { description: Datos inválidos }
 *       401: { description: Credenciales de autenticación ausentes o inválidas }
 *       403: { description: Usuario sin permisos para realizar la operación }
 *       404: { description: Vendedor no encontrado }
 *       409: { description: Conflicto de asociación usuario–vendedor }
 *   delete:
 *     tags: [Vendedores]
 *     summary: Eliminar vendedor
 *     security:
 *       - ApiKeyAuth: []
 *         BearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200: { description: Vendedor eliminado }
 *       401: { description: Credenciales de autenticación ausentes o inválidas }
 *       403: { description: Usuario sin permisos para realizar la operación }
 *       404: { description: Vendedor no encontrado }
 *       409: { description: El vendedor tiene ventas asociadas }
 */
router.get('/:id', autenticarJWT, autorizarRoles('administrador', 'vendedor', 'cliente'), validarIdVendedor, validar, vendedoresController.obtener);
router.put('/:id', autenticarJWT, autorizarRoles('administrador'), validarIdVendedor, validarVendedor, validar, vendedoresController.actualizar);
router.patch('/:id', autenticarJWT, autorizarRoles('administrador'), validarIdVendedor, validarVendedorParcial, validar, vendedoresController.actualizarParcial);
router.delete('/:id', autenticarJWT, autorizarRoles('administrador'), validarIdVendedor, validar, vendedoresController.eliminar);

module.exports = router;