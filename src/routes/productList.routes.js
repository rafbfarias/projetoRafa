const express = require('express');
const router = express.Router();
const productListController = require('../controllers/productList.controller');
const supplierAuthMiddleware = require('../middleware/supplierAuth.middleware');

// Proteger todas as rotas com o middleware de autenticação de fornecedor
router.use(supplierAuthMiddleware);

// Rota para buscar todos os produtos do fornecedor do usuário atual
router.get('/', productListController.getMyProductLists);

// Rota para buscar ProductParents sem fornecedores (que podem receber ofertas)
router.get('/available-productparents', productListController.getAvailableProductParents);

// Rota para criar um novo produto
router.post('/', productListController.createProductList);

// Rota para adicionar um produto a um ProductParent
router.post('/add-to-productparent', productListController.addToProductParent);

// Rota para atualizar um produto
router.put('/:id', productListController.updateProductList);

// Rota para remover (desativar) um produto
router.delete('/:id', productListController.deleteProductList);

module.exports = router; 