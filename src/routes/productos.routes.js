const { Router } = require('express');
const router = Router();
const autenticarJWT = require('../middlewares/auth.middleware');
const autorizarRoles = require('../middlewares/roles.middleware');
const productosController = require('../controllers/productos.controller');
const validarCampos = require('../middlewares/validar.middleware');
const {
  crearProductoValidator,
  actualizarProductoValidator,
  idValidator,
} = require('../middlewares/productos.validator');

/**
 * @swagger
 * tags:
 *   name: Productos
 *   description: Gestión de productos e inventario
 */

/**
 * @swagger
 * /productos:
 *   get:
 *     summary: Listar todos los productos
 *     tags: [Productos]
 *     security:
 *       - ApiKeyAuth: []
 *         BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de productos
 *       401:
 *         description: Credenciales de autenticación ausentes o inválidas
 *       403:
 *         description: Usuario sin permisos para realizar la operación
 */
router.get(
  '/',
  autenticarJWT,
  autorizarRoles('administrador', 'vendedor', 'cliente'),
  productosController.listar
);

/**
 * @swagger
 * /productos/{id}:
 *   get:
 *     summary: Obtener un producto por id
 *     tags: [Productos]
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
 *         description: Producto encontrado
 *       401:
 *         description: Credenciales de autenticación ausentes o inválidas
 *       403:
 *         description: Usuario sin permisos para realizar la operación
 *       404:
 *         description: Producto no encontrado
 */
router.get(
  '/:id',
  autenticarJWT,
  autorizarRoles('administrador', 'vendedor', 'cliente'),
  idValidator,
  validarCampos,
  productosController.obtener
);

/**
 * @swagger
 * /productos:
 *   post:
 *     summary: Crear un nuevo producto
 *     tags: [Productos]
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
 *               - precio
 *               - categoriaId
 *               - proveedorId
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Aceite Gourmet 1L
 *               precio:
 *                 type: number
 *                 example: 9500
 *               stock:
 *                 type: integer
 *                 example: 30
 *               categoriaId:
 *                 type: integer
 *                 example: 2
 *               proveedorId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Producto creado
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
  crearProductoValidator,
  validarCampos,
  productosController.crear
);

/**
 * @swagger
 * /productos/{id}:
 *   put:
 *     summary: Actualizar un producto
 *     tags: [Productos]
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
 *               precio:
 *                 type: number
 *               stock:
 *                 type: integer
 *               categoriaId:
 *                 type: integer
 *               proveedorId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Producto actualizado
 *       401:
 *         description: Credenciales de autenticación ausentes o inválidas
 *       403:
 *         description: Usuario sin permisos para realizar la operación
 *       404:
 *         description: Producto no encontrado
 */
router.put(
  '/:id',
  autenticarJWT,
  autorizarRoles('administrador'),
  actualizarProductoValidator,
  validarCampos,
  productosController.actualizar
);

/**
 * @swagger
 * /productos/{id}:
 *   delete:
 *     summary: Eliminar un producto
 *     tags: [Productos]
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
 *         description: Producto eliminado
 *       401:
 *         description: Credenciales de autenticación ausentes o inválidas
 *       403:
 *         description: Usuario sin permisos para realizar la operación
 *       404:
 *         description: Producto no encontrado
 */
router.delete(
  '/:id',
  autenticarJWT,
  autorizarRoles('administrador'),
  idValidator,
  validarCampos,
  productosController.eliminar
);

module.exports = router;