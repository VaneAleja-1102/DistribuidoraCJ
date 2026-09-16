const { Router } = require('express');
const router = Router();

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
 *     responses:
 *       200:
 *         description: Lista de proveedores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Proveedor'
 */
router.get('/', proveedoresController.listar);

/**
 * @swagger
 * /proveedores/{id}:
 *   get:
 *     summary: Obtener un proveedor por id
 *     tags: [Proveedores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Proveedor encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Proveedor'
 *       404:
 *         description: Proveedor no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', idValidator, validarCampos, proveedoresController.obtener);

/**
 * @swagger
 * /proveedores:
 *   post:
 *     summary: Crear un nuevo proveedor
 *     tags: [Proveedores]
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Proveedor'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', crearProveedorValidator, validarCampos, proveedoresController.crear);

/**
 * @swagger
 * /proveedores/{id}:
 *   put:
 *     summary: Actualizar un proveedor
 *     tags: [Proveedores]
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Proveedor'
 *       404:
 *         description: Proveedor no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', actualizarProveedorValidator, validarCampos, proveedoresController.actualizar);

/**
 * @swagger
 * /proveedores/{id}:
 *   delete:
 *     summary: Eliminar un proveedor
 *     tags: [Proveedores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Proveedor eliminado
 *       404:
 *         description: Proveedor no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', idValidator, validarCampos, proveedoresController.eliminar);
router.get('/', proveedoresController.listar);
router.get('/:id', idValidator, validarCampos, proveedoresController.obtener);
router.post('/', crearProveedorValidator, validarCampos, proveedoresController.crear);
router.put('/:id', actualizarProveedorValidator, validarCampos, proveedoresController.actualizar);
router.delete('/:id', idValidator, validarCampos, proveedoresController.eliminar);

module.exports = router;