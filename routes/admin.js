const path = require('path');

const express = require('express');
const { body } = require('express-validator/check');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/isAuth');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product', 
  [
    body('title').trim().isString().isLength({ min: 3 }),
    body('price').isFloat(),
    body('description').isLength({ min: 5, max: 400 }).trim()
  ], 
  isAuth, 
  adminController.postAddProduct
);

router.get('/edit-product/:productId',  
  [
    body('title').trim().isString().isLength({ min: 3 }),
    body('price').isFloat(),
    body('description').isLength({ min: 5, max: 400 }).trim()
  ], 
  isAuth, 
  adminController.getEditProduct
);

router.post('/edit-product', isAuth, adminController.postEditProduct);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;
