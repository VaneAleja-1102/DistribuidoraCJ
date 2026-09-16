const { Router } = require('express');
const router = Router();

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
 *     responses:
 *       200:
 *         description: Lista de productos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Producto'
 */
router.get('/', productosController.listar);

/**
 * @swagger
 * /productos/{id}:
 *   get:
 *     summary: Obtener un producto por id
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Producto'
 *       404:
 *         description: Producto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', idValidator, validarCampos, productosController.obtener);

/**
 * @swagger
 * /productos:
 *   post:
 *     summary: Crear un nuevo producto
 *     tags: [Productos]
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Producto'
 *       400:
 *         description: Error de validación (categoría o proveedor inexistente, datos faltantes)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', crearProductoValidator, validarCampos, productosController.crear);

/**
 * @swagger
 * /productos/{id}:
 *   put:
 *     summary: Actualizar un producto
 *     tags: [Productos]
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Producto'
 *       404:
 *         description: Producto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', actualizarProductoValidator, validarCampos, productosController.actualizar);

/**
 * @swagger
 * /productos/{id}:
 *   delete:
 *     summary: Eliminar un producto
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto eliminado
 *       404:
 *         description: Producto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', idValidator, validarCampos, productosController.eliminar);
router.get('/', productosController.listar);
router.get('/:id', idValidator, validarCampos, productosController.obtener);
router.post('/', crearProductoValidator, validarCampos, productosController.crear);
router.put('/:id', actualizarProductoValidator, validarCampos, productosController.actualizar);
router.delete('/:id', idValidator, validarCampos, productosController.eliminar);

module.exports = router;