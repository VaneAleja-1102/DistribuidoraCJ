const { Router } = require('express');
const router = Router();
const autenticarJWT = require('../middlewares/auth.middleware');
const autorizarRoles = require('../middlewares/roles.middleware');
const proveedoresController = require('../controllers/proveedores.controller');
const validarCampos = require('../middlewares/validar.middleware');
const {
  crearProveedorValidator,
  actualizarProveedorValidator,
  idValidator,
} = require('../middlewares/proveedores.validator');

/**
 * @swagger
 * tags:
 *   name: Proveedores
 *   description: Gestión de proveedores
 */

/**
 * @swagger
 * /proveedores:
 *   get:
 *     summary: Listar todos los proveedores
 *     tags: [Proveedores]
 *     security:
 *       - ApiKeyAuth: []
 *         BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de proveedores
 *       401:
 *         description: Credenciales de autenticación ausentes o inválidas
 *       403:
 *         description: Usuario sin permisos para realizar la operación
 */
router.get(
  '/',
  autenticarJWT,
  autorizarRoles('administrador', 'vendedor'),
  proveedoresController.listar
);

/**
 * @swagger
 * /proveedores/{id}:
 *   get:
 *     summary: Obtener un proveedor por id
 *     tags: [Proveedores]
 *     security:
 *       - ApiKeyAuth: []
 *         BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Proveedor encontrado
 *       401:
 *         description: Credenciales de autenticación ausentes o inválidas
 *       403:
 *         description: Usuario sin permisos para realizar la operación
 *       404:
 *         description: Proveedor no encontrado
 */
router.get(
  '/:id',
  autenticarJWT,
  autorizarRoles('administrador', 'vendedor'),
  idValidator,
  validarCampos,
  proveedoresController.obtener
);

/**
 * @swagger
 * /proveedores:
 *   post:
 *     summary: Crear un nuevo proveedor
 *     tags: [Proveedores]
 *     security:
 *       - ApiKeyAuth: []
 *         BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Distribuidora El Sol
 *               telefono:
 *                 type: string
 *                 example: "3001234567"
 *               email:
 *                 type: string
 *                 example: contacto@elsol.com
 *     responses:
 *       201:
 *         description: Proveedor creado
 *       400:
 *         description: Error de validación
 *       401:
 *         description: Credenciales de autenticación ausentes o inválidas
 *       403:
 *         description: Usuario sin permisos para realizar la operación
 */
router.post(
  '/',
  autenticarJWT,
  autorizarRoles('administrador'),
  crearProveedorValidator,
  validarCampos,
  proveedoresController.crear
);

/**
 * @swagger
 * /proveedores/{id}:
 *   put:
 *     summary: Actualizar un proveedor
 *     tags: [Proveedores]
 *     security:
 *       - ApiKeyAuth: []
 *         BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               telefono:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Proveedor actualizado
 *       401:
 *         description: Credenciales de autenticación ausentes o inválidas
 *       403:
 *         description: Usuario sin permisos para realizar la operación
 *       404:
 *         description: Proveedor no encontrado
 */
router.put(
  '/:id',
  autenticarJWT,
  autorizarRoles('administrador'),
  actualizarProveedorValidator,
  validarCampos,
  proveedoresController.actualizar
);

/**
 * @swagger
 * /proveedores/{id}:
 *   delete:
 *     summary: Eliminar un proveedor
 *     tags: [Proveedores]
 *     security:
 *       - ApiKeyAuth: []
 *         BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Proveedor eliminado
 *       401:
 *         description: Credenciales de autenticación ausentes o inválidas
 *       403:
 *         description: Usuario sin permisos para realizar la operación
 *       404:
 *         description: Proveedor no encontrado
 */
router.delete(
  '/:id',
  autenticarJWT,
  autorizarRoles('administrador'),
  idValidator,
  validarCampos,
  proveedoresController.eliminar
);

module.exports = router;