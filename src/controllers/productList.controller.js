const { ProductList } = require('../models/productList.model');
const { ProductParent } = require('../models/productParent.model');
const { ProductRelation } = require('../models/productRelation.model');
const fs = require('fs');
const path = require('path');

/**
 * Retorna todos os produtos (ProductList) do fornecedor do usuário atual
 * Acessível apenas para usuários com supplier associado
 */
exports.getMyProductLists = async (req, res) => {
  try {
    // O middleware supplierAuth já verificou se o usuário tem supplier associado
    // e adicionou o supplier ao req
    const supplier = req.supplier;
    
    // Buscar todos os ProductList do supplier
    const productLists = await ProductList.find({ 
      supplierIdRef: supplier._id 
    }).sort({ productName: 1 });
    
    res.status(200).json({
      success: true,
      count: productLists.length,
      data: productLists
    });
  } catch (error) {
    console.error('Erro ao buscar produtos do fornecedor:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar produtos',
      details: error.message
    });
  }
};

/**
 * Cria um novo produto (ProductList) para o fornecedor do usuário atual
 * Acessível apenas para usuários com supplier associado
 */
exports.createProductList = async (req, res) => {
  try {
    const supplier = req.supplier;
    const productData = req.body.data ? JSON.parse(req.body.data) : req.body;
    
    // Verificar dados obrigatórios
    if (!productData.productName || !productData.unitMeasure || !productData.currentPrice) {
      return res.status(400).json({
        success: false,
        error: 'Dados obrigatórios não fornecidos',
        details: 'Nome do produto, unidade de medida e preço são obrigatórios'
      });
    }
    
    // Gerar ID único para o produto se não fornecido
    if (!productData.productId) {
      productData.productId = `PL-${supplier._id.toString().substr(-6)}-${Date.now()}`;
    } else {
      // Verificar se já existe um produto com este ID
      const existingProduct = await ProductList.findOne({ productId: productData.productId });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          error: 'ID de produto já existe',
          details: 'Por favor, escolha um ID diferente'
        });
      }
    }
    
    // Processar upload de imagem se fornecido
    let photoPath = '';
    if (req.files && req.files.photo) {
      const photoFile = req.files.photo;
      const uploadDir = path.join(__dirname, '../../public/uploads/products');
      
      // Garantir que o diretório existe
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      // Gerar nome de arquivo único
      const timestamp = Date.now();
      const filename = `${timestamp}_${photoFile.name.replace(/\s+/g, '_')}`;
      photoPath = `/uploads/products/${filename}`;
      
      // Salvar o arquivo
      await photoFile.mv(path.join(uploadDir, filename));
    }
    
    // Criar o objeto ProductList
    const newProductList = new ProductList({
      // Dados básicos do produto
      productId: productData.productId,
      productName: productData.productName,
      description: productData.description || '',
      unitMeasure: productData.unitMeasure,
      currentPrice: productData.currentPrice,
      minimumQuantity: productData.minimumQuantity || 1,
      
      // Dados do fornecedor (a partir do supplier autenticado)
      supplierIdRef: supplier._id,
      supplierName: supplier.name,
      supplierEmail: supplier.email || '',
      supplierDescription: supplier.description || '',
      
      // Dados da empresa e unidade do fornecedor
      companyIdRef: supplier.companyId,
      unitIdRef: supplier.unitId,
      
      // Outros dados
      photo: photoPath,
      allergens: productData.allergens || [],
      priority: productData.priority || 5,
      available: true,
      approvalStatus: 'aprovado', // Auto-aprovado pois o próprio fornecedor está criando
      
      // Dados opcionais
      equivalentQuantity: productData.equivalentQuantity,
      equivalentPrice: productData.equivalentPrice,
      observations: productData.observations || ''
    });
    
    // Salvar o produto
    const savedProduct = await newProductList.save();
    
    res.status(201).json({
      success: true,
      data: savedProduct,
      message: 'Produto criado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar produto',
      details: error.message
    });
  }
};

/**
 * Atualiza um produto (ProductList) do fornecedor do usuário atual
 * Acessível apenas para usuários com supplier associado
 */
exports.updateProductList = async (req, res) => {
  try {
    const supplier = req.supplier;
    const productId = req.params.id;
    const updateData = req.body;
    
    // Verificar se o produto existe e pertence ao fornecedor
    const product = await ProductList.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }
    
    // Verificar se o produto pertence ao fornecedor
    if (product.supplierIdRef.toString() !== supplier._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado',
        details: 'Este produto não pertence ao seu fornecedor'
      });
    }
    
    // Processar upload de imagem se fornecido
    if (req.files && req.files.photo) {
      const photoFile = req.files.photo;
      const uploadDir = path.join(__dirname, '../../public/uploads/products');
      
      // Garantir que o diretório existe
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      // Gerar nome de arquivo único
      const timestamp = Date.now();
      const filename = `${timestamp}_${photoFile.name.replace(/\s+/g, '_')}`;
      updateData.photo = `/uploads/products/${filename}`;
      
      // Salvar o arquivo
      await photoFile.mv(path.join(uploadDir, filename));
      
      // Remover foto antiga se existir e não for a mesma
      if (product.photo && product.photo !== updateData.photo) {
        const oldPhotoPath = path.join(__dirname, '../../public', product.photo);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
    }
    
    // Atualizar o produto
    const updatedProduct = await ProductList.findByIdAndUpdate(
      productId,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: updatedProduct,
      message: 'Produto atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar produto',
      details: error.message
    });
  }
};

/**
 * Remove (desativa) um produto (ProductList) do fornecedor do usuário atual
 * Acessível apenas para usuários com supplier associado
 */
exports.deleteProductList = async (req, res) => {
  try {
    const supplier = req.supplier;
    const productId = req.params.id;
    
    // Verificar se o produto existe e pertence ao fornecedor
    const product = await ProductList.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }
    
    // Verificar se o produto pertence ao fornecedor
    if (product.supplierIdRef.toString() !== supplier._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado',
        details: 'Este produto não pertence ao seu fornecedor'
      });
    }
    
    // Em vez de excluir, marcar como indisponível
    product.available = false;
    await product.save();
    
    // Atualizar todas as relações deste produto
    await ProductRelation.updateMany(
      { productListId: productId },
      { status: 'inativo' }
    );
    
    res.status(200).json({
      success: true,
      message: 'Produto removido com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover produto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao remover produto',
      details: error.message
    });
  }
};

/**
 * Busca ProductParents sem fornecedores disponíveis
 * Permite que o fornecedor veja produtos que pode oferecer
 */
exports.getAvailableProductParents = async (req, res) => {
  try {
    const products = await ProductParent.find({ 
      hasSuppliers: false,
      isVisible: true 
    });
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Erro ao buscar produtos disponíveis:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar produtos disponíveis',
      details: error.message
    });
  }
};

/**
 * Adiciona um ProductList do fornecedor a um ProductParent existente
 * Permite que um fornecedor ofereça seu produto para um ProductParent
 */
exports.addToProductParent = async (req, res) => {
  try {
    const supplier = req.supplier;
    const { productListId, productParentId } = req.body;
    
    // Verificar dados obrigatórios
    if (!productListId || !productParentId) {
      return res.status(400).json({
        success: false,
        error: 'Dados incompletos',
        details: 'ID do ProductList e ID do ProductParent são obrigatórios'
      });
    }
    
    // Verificar se o ProductParent existe
    const productParent = await ProductParent.findById(productParentId);
    if (!productParent) {
      return res.status(404).json({
        success: false,
        error: 'ProductParent não encontrado',
        details: 'O produto solicitado não existe'
      });
    }
    
    // Verificar se o ProductList existe e pertence ao fornecedor
    const productList = await ProductList.findById(productListId);
    if (!productList) {
      return res.status(404).json({
        success: false,
        error: 'ProductList não encontrado',
        details: 'O produto do fornecedor não existe'
      });
    }
    
    if (productList.supplierIdRef.toString() !== supplier._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado',
        details: 'Este produto não pertence ao seu fornecedor'
      });
    }
    
    // Verificar se já existe uma relação entre estes produtos
    const existingRelation = await ProductRelation.findOne({
      productListId,
      productParentId,
      companyId: supplier.companyId,
      unitId: supplier.unitId
    });
    
    if (existingRelation) {
      return res.status(400).json({
        success: false,
        error: 'Relação já existe',
        details: 'Este produto já está associado ao ProductParent'
      });
    }
    
    // Criar a nova relação
    const newRelation = new ProductRelation({
      productListId,
      productParentId,
      companyId: supplier.companyId,
      unitId: supplier.unitId,
      status: 'ativo',
      createdBy: req.session.user._id,
      lastUpdatedBy: req.session.user._id
    });
    
    // Calcular equivalências
    await newRelation.calculateEquivalences();
    
    // Salvar a relação
    const savedRelation = await newRelation.save();
    
    // Atualizar o ProductParent para indicar que agora tem fornecedores
    if (!productParent.hasSuppliers) {
      productParent.hasSuppliers = true;
      await productParent.save();
    }
    
    res.status(201).json({
      success: true,
      data: savedRelation,
      message: 'Produto adicionado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao adicionar produto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao adicionar produto',
      details: error.message
    });
  }
}; 