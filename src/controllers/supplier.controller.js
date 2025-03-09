const { Supplier } = require('../models/supplier.model');
const { ProductList } = require('../models/productList.model');

/**
 * Busca todos os fornecedores
 */
exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({ active: true });
    
    res.status(200).json({
      success: true,
      count: suppliers.length,
      data: suppliers
    });
  } catch (error) {
    console.error('Erro ao buscar fornecedores:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar fornecedores',
      details: error.message
    });
  }
};

/**
 * Busca um fornecedor específico por ID
 */
exports.getSupplierById = async (req, res) => {
  try {
    const supplierId = req.params.id;
    
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: 'Fornecedor não encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: supplier
    });
  } catch (error) {
    console.error('Erro ao buscar fornecedor:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar fornecedor',
      details: error.message
    });
  }
};

/**
 * Busca todos os ProductList associados a um fornecedor
 */
exports.getSupplierProductLists = async (req, res) => {
  try {
    const supplierId = req.params.id;
    
    // Verificar se o fornecedor existe
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        error: 'Fornecedor não encontrado'
      });
    }
    
    // Buscar os ProductLists associados ao fornecedor
    const productLists = await ProductList.find({ 
      supplierIdRef: supplierId,
      available: true
    });
    
    res.status(200).json({
      success: true,
      count: productLists.length,
      data: productLists
    });
  } catch (error) {
    console.error('Erro ao buscar ProductLists do fornecedor:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar produtos do fornecedor',
      details: error.message
    });
  }
};

/**
 * Cria um novo fornecedor
 */
exports.createSupplier = async (req, res) => {
  try {
    const supplierData = req.body;
    
    // Verificar dados obrigatórios
    if (!supplierData.name || !supplierData.email) {
      return res.status(400).json({
        success: false,
        error: 'Dados obrigatórios não fornecidos',
        details: 'Nome e email são obrigatórios'
      });
    }
    
    // Verificar se já existe um fornecedor com o mesmo email
    const existingSupplier = await Supplier.findOne({ email: supplierData.email });
    if (existingSupplier) {
      return res.status(400).json({
        success: false,
        error: 'Fornecedor já existe',
        details: 'Já existe um fornecedor com este email'
      });
    }
    
    // Criar o fornecedor
    const newSupplier = new Supplier(supplierData);
    await newSupplier.save();
    
    res.status(201).json({
      success: true,
      data: newSupplier,
      message: 'Fornecedor criado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar fornecedor:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar fornecedor',
      details: error.message
    });
  }
};

/**
 * Atualiza um fornecedor existente
 */
exports.updateSupplier = async (req, res) => {
  try {
    const supplierId = req.params.id;
    const updateData = req.body;
    
    // Buscar e atualizar o fornecedor
    const updatedSupplier = await Supplier.findByIdAndUpdate(
      supplierId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedSupplier) {
      return res.status(404).json({
        success: false,
        error: 'Fornecedor não encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: updatedSupplier,
      message: 'Fornecedor atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar fornecedor:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar fornecedor',
      details: error.message
    });
  }
};

/**
 * Remove um fornecedor (marcando como inativo)
 */
exports.deleteSupplier = async (req, res) => {
  try {
    const supplierId = req.params.id;
    
    // Em vez de excluir fisicamente, marcamos como inativo
    const deletedSupplier = await Supplier.findByIdAndUpdate(
      supplierId,
      { active: false },
      { new: true }
    );
    
    if (!deletedSupplier) {
      return res.status(404).json({
        success: false,
        error: 'Fornecedor não encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Fornecedor removido com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover fornecedor:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao remover fornecedor',
      details: error.message
    });
  }
}; 