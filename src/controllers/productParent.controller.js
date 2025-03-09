const fs = require('fs');
const path = require('path');
const { ProductParent } = require('../models/productParent.model');
const { ProductList } = require('../models/productList.model');
const { ProductRelation } = require('../models/productRelation.model');

/**
 * Busca todos os produtos parent
 */
exports.getAllProductParents = async (req, res) => {
  try {
    const products = await ProductParent.find();
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar produtos',
      details: error.message
    });
  }
};

/**
 * Busca um produto parent por ID
 */
exports.getProductParentById = async (req, res) => {
  try {
    const productParent = await ProductParent.findById(req.params.id)
      .populate('preparations');
    
    if (!productParent) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: productParent
    });
  } catch (error) {
    console.error('Erro ao buscar produto por ID:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar produto',
      details: error.message
    });
  }
};

/**
 * Cria um novo produto parent com suas variantes
 */
exports.createProductParent = async (req, res) => {
  try {
    const productData = req.body.data ? JSON.parse(req.body.data) : req.body;
    
    // Verificar dados obrigatórios
    if (!productData.parentId || !productData.productName || !productData.productFamily || 
        !productData.unitMeasure || !productData.averagePrice) {
      return res.status(400).json({
        success: false,
        error: 'Dados obrigatórios não fornecidos',
        details: 'Todos os campos obrigatórios devem ser preenchidos'
      });
    }
    
    // Verificar se já existe um produto com o mesmo ID
    const existingProduct = await ProductParent.findOne({ parentId: productData.parentId });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        error: 'Produto já existe',
        details: 'Já existe um produto com este ID'
      });
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
    
    // Criar o objeto ProductParent
    const newProduct = new ProductParent({
      parentId: productData.parentId,
      productName: productData.productName,
      description: productData.description || '',
      productFamily: productData.productFamily,
      unitMeasure: productData.unitMeasure,
      averagePrice: productData.averagePrice,
      photo: photoPath,
      preparations: productData.preparations || [],
      allergens: productData.allergens || [],
      hasSuppliers: false // Indicar que não tem fornecedores inicialmente
    });
    
    // Salvar o produto pai
    await newProduct.save();
    
    // Arrays para armazenar os items criados
    const createdRelations = [];
    const createdLists = [];
    
    // Processar os produtos na lista (ProductList) relacionados a este, se houver
    if (productData.variants && productData.variants.length > 0) {
      // Atualizar para indicar que tem fornecedores
      newProduct.hasSuppliers = true;
      await newProduct.save();
      
      for (const variant of productData.variants) {
        try {
          // Criar o produto na lista (ProductList)
          const newProductList = new ProductList({
            productId: variant.productId || `${productData.parentId}-${Date.now()}`,
            productName: variant.productName || productData.productName,
            description: variant.description || productData.description || '',
            unitMeasure: variant.unitMeasure,
            currentPrice: variant.currentPrice,
            minimumQuantity: variant.minimumQuantity || 1,
            supplierIdRef: variant.supplierId,
            supplierName: variant.supplierName,
            supplierEmail: variant.supplierEmail || '',
            supplierDescription: variant.supplierDescription || '',
            companyIdRef: variant.companyIdRef,
            unitIdRef: variant.unitIdRef,
            available: true,
            photo: variant.photo || photoPath,
            allergens: variant.allergens || productData.allergens || [],
            priority: variant.priority || 5,
            equivalentQuantity: variant.equivalentQuantity,
            equivalentPrice: variant.equivalentPrice,
            observations: variant.observations || ''
          });
          
          // Determinar o status de aprovação
          // Se o usuário atual for o fornecedor, ou pertencer à company/unit, aprovar automaticamente
          // Caso contrário, marcar como pendente de aprovação
          // Isso normalmente seria baseado no usuário atual da sessão
          newProductList.approvalStatus = 'aprovado'; // Simplificado; normalmente baseado em lógica de permissão
          
          // Salvar o produto na lista
          const savedProductList = await newProductList.save();
          createdLists.push(savedProductList);
          
          // Criar a relação entre o ProductList e o ProductParent
          const newRelation = new ProductRelation({
            productListId: savedProductList._id,
            productParentId: newProduct._id,
            companyId: variant.companyIdRef,
            unitId: variant.unitIdRef,
            status: 'ativo',
            equivalentQuantity: variant.equivalentQuantity,
            equivalentPrice: variant.equivalentPrice,
            // Normalmente preenchido com o usuário atual da sessão
            createdBy: null,
            lastUpdatedBy: null
          });
          
          // Calcular equivalências se necessário
          await newRelation.calculateEquivalences();
          
          // Salvar a relação
          const savedRelation = await newRelation.save();
          createdRelations.push(savedRelation);
        } catch (variantError) {
          console.error('Erro ao processar variante:', variantError);
          // Continuar com as próximas variantes
        }
      }
    }
    
    // Retornar resposta de sucesso
    res.status(201).json({
      success: true,
      data: {
        product: newProduct,
        productLists: createdLists,
        relations: createdRelations
      },
      message: createdLists.length > 0 
        ? 'Produto e variantes criados com sucesso' 
        : 'Produto criado com sucesso (sem fornecedores)'
    });
    
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar o produto',
      details: error.message
    });
  }
};

/**
 * Atualiza um produto parent existente
 */
exports.updateProductParent = async (req, res) => {
  try {
    const productId = req.params.id;
    const updateData = req.body;
    
    // Buscar e atualizar o produto
    const updatedProduct = await ProductParent.findByIdAndUpdate(
      productId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      data: updatedProduct
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar o produto',
      details: error.message
    });
  }
};

/**
 * Remove um produto parent
 */
exports.deleteProductParent = async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Primeiro, excluir todas as relações associadas
    await ProductRelation.deleteMany({ productParentId: productId });
    
    // Em seguida, excluir o produto pai
    const deletedProduct = await ProductParent.findByIdAndDelete(productId);
    
    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Produto e todas as suas relações foram excluídos com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro ao excluir o produto',
      details: error.message
    });
  }
};

/**
 * Busca produtos por termo de pesquisa
 */
exports.searchProductParents = async (req, res) => {
  try {
    const { term } = req.params;
    const regex = new RegExp(term, 'i');
    
    const productParents = await ProductParent.find({
      $or: [
        { name: regex },
        { description: regex },
        { category: regex }
      ]
    }).populate('preparations');
    
    return res.status(200).json({
      success: true,
      count: productParents.length,
      data: productParents
    });
  } catch (error) {
    console.error('Erro ao pesquisar produtos:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao pesquisar produtos',
      details: error.message
    });
  }
};

/**
 * Busca produtos por categoria
 */
exports.getProductParentsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const productParents = await ProductParent.find({ category })
      .populate('preparations')
      .sort({ name: 1 });
    
    return res.status(200).json({
      success: true,
      count: productParents.length,
      data: productParents
    });
  } catch (error) {
    console.error('Erro ao buscar produtos por categoria:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar produtos por categoria',
      details: error.message
    });
  }
};

/**
 * Obter um produto pai específico
 */
exports.getProductParent = async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Buscar o produto pai
    const product = await ProductParent.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }
    
    // Buscar as relações deste produto
    const relations = await ProductRelation.find({ productParentId: productId })
      .populate('productList')
      .populate('company')
      .populate('unit');
    
    res.status(200).json({
      success: true,
      data: {
        product,
        relations
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar o produto',
      details: error.message
    });
  }
};

/**
 * Adicionar um ProductList a um ProductParent existente
 * Usado quando um fornecedor quer adicionar seu produto a um ProductParent na loja
 */
exports.addSupplierToProduct = async (req, res) => {
  try {
    const productId = req.params.id; // ID do ProductParent
    const { productListId, companyId, unitId } = req.body;
    
    // Verificar dados obrigatórios
    if (!productListId || !companyId || !unitId) {
      return res.status(400).json({
        success: false,
        error: 'Dados incompletos',
        details: 'ProductList ID, Company ID e Unit ID são obrigatórios'
      });
    }
    
    // Verificar se o ProductParent existe
    const productParent = await ProductParent.findById(productId);
    if (!productParent) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado',
        details: 'O ProductParent especificado não existe'
      });
    }
    
    // Verificar se o ProductList existe
    const productList = await ProductList.findById(productListId);
    if (!productList) {
      return res.status(404).json({
        success: false,
        error: 'ProductList não encontrado',
        details: 'O ProductList especificado não existe'
      });
    }
    
    // Verificar se já existe uma relação entre estes produtos
    const existingRelation = await ProductRelation.findOne({
      productListId,
      productParentId: productId,
      companyId,
      unitId
    });
    
    if (existingRelation) {
      return res.status(400).json({
        success: false,
        error: 'Relação já existe',
        details: 'Este produto já está associado ao ProductParent para esta company/unit'
      });
    }
    
    // Criar a nova relação
    const newRelation = new ProductRelation({
      productListId,
      productParentId: productId,
      companyId,
      unitId,
      status: 'ativo',
      // Em um ambiente real, o status poderia ser 'pendente' se precisar de aprovação
      // da company/unit antes de aparecer na loja
      createdBy: req.user ? req.user._id : null,
      lastUpdatedBy: req.user ? req.user._id : null
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
    
    // Retornar resposta de sucesso
    res.status(201).json({
      success: true,
      data: savedRelation,
      message: 'Produto adicionado com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao adicionar fornecedor:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao adicionar fornecedor ao produto',
      details: error.message
    });
  }
};

/**
 * Listar todos os ProductParent que não têm fornecedores (para exibição na loja)
 * Permite que fornecedores vejam produtos que podem oferecer
 */
exports.getProductsWithoutSuppliers = async (req, res) => {
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
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar produtos sem fornecedores',
      details: error.message
    });
  }
}; 