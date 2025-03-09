const express = require('express');
const router = express.Router();
const productParentController = require('../controllers/productParent.controller');

// Rota para buscar todos os produtos
router.get('/', productParentController.getAllProductParents);

// Rota para buscar produtos sem fornecedores (para a loja online)
router.get('/without-suppliers', productParentController.getProductsWithoutSuppliers);

// Rota para adicionar um fornecedor a um produto existente
router.post('/:id/add-supplier', productParentController.addSupplierToProduct);

// Rota para buscar produtos por termo de pesquisa
router.get('/search/:term', productParentController.searchProductParents);

// Rota para buscar produtos por categoria
router.get('/category/:category', productParentController.getProductParentsByCategory);

// Rota para criar um novo produto
router.post('/', productParentController.createProductParent);

// Rota para buscar um produto específico por ID
router.get('/:id', productParentController.getProductParent);

// Rota para atualizar um produto
router.put('/:id', productParentController.updateProductParent);

// Rota para excluir um produto
router.delete('/:id', productParentController.deleteProductParent);

module.exports = router; 