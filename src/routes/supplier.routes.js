const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplier.controller');

// Rota para buscar todos os fornecedores
router.get('/', supplierController.getAllSuppliers);

// Rota para buscar os ProductLists de um fornecedor específico
router.get('/:id/productlists', supplierController.getSupplierProductLists);

// Rota para buscar um fornecedor específico por ID
router.get('/:id', supplierController.getSupplierById);

// Rota para criar um novo fornecedor
router.post('/', supplierController.createSupplier);

// Rota para atualizar um fornecedor
router.put('/:id', supplierController.updateSupplier);

// Rota para remover um fornecedor
router.delete('/:id', supplierController.deleteSupplier);

module.exports = router; 