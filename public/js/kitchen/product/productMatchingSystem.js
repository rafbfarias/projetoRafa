import React, { useState } from 'react';
import { 
  ArrowRight,
  RefreshCw,
  Truck,
  Star,
  DollarSign,
  Map,
  ArrowDownCircle,
  CheckCircle,
  AlertTriangle,
  ShoppingCart,
  Package,
  Tag
} from 'lucide-react';

const ProductMatchingSystem = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [matchedVariant, setMatchedVariant] = useState(null);
  const [showMatchDetails, setShowMatchDetails] = useState(false);
  const [unit, setUnit] = useState('Porto');

  // Mock data for umbrella products
  const umbrellaProducts = [
    {
      id: 1,
      name: 'Filé Mignon',
      category: 'Carnes',
      image: '/api/placeholder/80/80',
      description: 'Corte nobre, extremamente macio e com pouca gordura.',
      price: 'A partir de €75,90/kg'
    },
    {
      id: 2,
      name: 'Picanha',
      category: 'Carnes',
      image: '/api/placeholder/80/80',
      description: 'Corte bovino suculento e saboroso, ideal para churrasco.',
      price: 'A partir de €79,90/kg'
    },
    {
      id: 3,
      name: 'Água Mineral',
      category: 'Bebidas',
      image: '/api/placeholder/80/80',
      description: 'Água mineral sem gás, purificada e de alta qualidade.',
      price: 'A partir de €1,25/un'
    },
    {
      id: 4,
      name: 'Tomate Italiano',
      category: 'Vegetais',
      image: '/api/placeholder/80/80',
      description: 'Tomate ideal para molhos e saladas, com sabor intenso.',
      price: 'A partir de €5,90/kg'
    },
    {
      id: 5,
      name: 'Queijo Mozzarella',
      category: 'Laticínios',
      image: '/api/placeholder/80/80',
      description: 'Queijo fresco e suave, perfeito para pizzas e sanduíches.',
      price: 'A partir de €45,90/kg'
    },
    {
      id: 6,
      name: 'Caixa para Pizza',
      category: 'Embalagens',
      image: '/api/placeholder/80/80',
      description: 'Caixa de papelão de alta qualidade para delivery de pizzas.',
      price: 'A partir de €0,85/un'
    }
  ];

  // Mock data for product variants
  const productVariants = {
    1: [
      {
        id: 101,
        supplier: 'FreshMeat Distribuidora',
        supplierRating: 4.8,
        price: 75.90,
        unit: 'kg',
        minOrder: 2,
        available: true,
        priority: 5,
        servedUnits: ['Porto', 'Matosinhos', 'Braga'],
        company: 'Restaurante A',
        deliveryTime: '1-2 dias úteis',
        stockStatus: 'Em estoque',
        isTopMatch: true,
        matchScore: 98
      },
      {
        id: 102,
        supplier: 'Açougue Premium',
        supplierRating: 4.5,
        price: 79.90,
        unit: 'kg',
        minOrder: 1,
        available: true,
        priority: 3,
        servedUnits: ['Porto', 'Lisboa'],
        company: 'Restaurante A',
        deliveryTime: '1 dia útil',
        stockStatus: 'Em estoque',
        isTopMatch: false,
        matchScore: 87
      },
      {
        id: 103,
        supplier: 'CarnesOnline',
        supplierRating: 4.2,
        price: 73.50,
        unit: 'kg',
        minOrder: 5,
        available: true,
        priority: 2,
        servedUnits: ['Lisboa', 'Setúbal'],
        company: 'Restaurante A',
        deliveryTime: '2-3 dias úteis',
        stockStatus: 'Estoque limitado',
        isTopMatch: false,
        matchScore: 65
      }
    ]
  };

  // Helper functions
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value);
  };

  // Function to handle product selection
  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    
    // Simulate the matching algorithm
    setTimeout(() => {
      // Find matching variants for the selected product
      const variants = productVariants[product.id];
      
      // Apply the matching logic
      if (variants) {
        const matchedVariants = variants
          // First filter: only consider variants that serve the user's unit
          .filter(variant => variant.servedUnits.includes(unit))
          // Sort by priority criteria
          .sort((a, b) => {
            // Primary: price
            if (a.price !== b.price) return a.price - b.price;
            // Secondary: manual priority
            if (a.priority !== b.priority) return b.priority - a.priority;
            // Tertiary: supplier rating
            return b.supplierRating - a.supplierRating;
          });
        
        if (matchedVariants.length > 0) {
          // Set the top match
          setMatchedVariant(matchedVariants[0]);
          setCurrentStep(2);
        } else {
          // No match found
          setMatchedVariant(null);
          alert('Não foi encontrado nenhum fornecedor que atenda à sua unidade para este produto.');
        }
      } else {
        // No variants available for this product
        setMatchedVariant(null);
        alert('Este produto não possui variantes disponíveis no momento.');
      }
    }, 1000);
  };

  // Function to add to cart
  const addToCart = () => {
    if (matchedVariant) {
      // Simulate adding to cart
      alert(`Produto adicionado ao carrinho: ${selectedProduct.name} - ${formatCurrency(matchedVariant.price)}/${matchedVariant.unit} (${matchedVariant.supplier})`);
      // Reset
      setCurrentStep(3);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Sistema de Matching de Produtos</h1>
        <p className="text-gray-600">Demonstração do sistema de matching que direciona para o produto mais adequado</p>
      </div>

      {/* Progress Steps */}
      <div className="p-4 bg-white rounded-lg shadow mb-6">
        <div className="flex items-center justify-center">
          <div className="flex items-center w-full max-w-3xl">
            <div className="flex flex-col items-center relative">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                <ShoppingCart className="w-5 h-5" />
              </div>
              <p className="mt-2 text-xs font-medium text-gray-700">Seleção</p>
              {currentStep > 1 && (
                <div className="absolute top-5 left-full w-full h-0.5 bg-blue-600 -translate-y-1/2"></div>
              )}
            </div>
            
            <div className="w-full"></div>
            
            <div className="flex flex-col items-center relative">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                <RefreshCw className="w-5 h-5" />
              </div>
              <p className="mt-2 text-xs font-medium text-gray-700">Matching</p>
              {currentStep > 2 && (
                <div className="absolute top-5 left-full w-full h-0.5 bg-blue-600 -translate-y-1/2"></div>
              )}
            </div>
            
            <div className="w-full"></div>
            
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                <CheckCircle className="w-5 h-5" />
              </div>
              <p className="mt-2 text-xs font-medium text-gray-700">Finalização</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Configuration (for demonstration purposes) */}
      <div className="bg-blue-50 p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">Configuração de Demonstração</h2>
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-blue-700 mb-1">Sua unidade atual:</label>
            <select 
              className="bg-white border border-blue-300 text-blue-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            >
              <option value="Porto">Porto</option>
              <option value="Matosinhos">Matosinhos</option>
              <option value="Braga">Braga</option>
              <option value="Lisboa">Lisboa</option>
              <option value="Setúbal">Setúbal</option>
            </select>
          </div>
          <div className="flex items-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              <Map className="w-4 h-4 mr-1" />
              Unidade: {unit}
            </div>
            <span className="mx-2 text-blue-500">•</span>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              <Package className="w-4 h-4 mr-1" />
              Empresa: Restaurante A
            </div>
          </div>
        </div>
      </div>

      {/* Step 1: Product Selection */}
      {currentStep === 1 && (
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Passo 1: Selecione um Produto da Loja Online
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Escolha um produto guarda-chuva da loja online. O sistema fará o matching para encontrar o produto específico do fornecedor mais adequado.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {umbrellaProducts.map((product) => (
              <div 
                key={product.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleProductSelect(product)}
              >
                <div className="p-4">
                  <div className="flex items-center">
                    <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded" />
                    <div className="ml-4">
                      <h3 className="text-md font-medium text-gray-800">{product.name}</h3>
                      <span className="inline-block px-2 py-0.5 mt-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {product.category}
                      </span>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-gray-600">{product.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">{product.price}</span>
                    <button className="text-blue-600 flex items-center text-sm font-medium hover:text-blue-800">
                      Selecionar
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Product Matching */}
      {currentStep === 2 && selectedProduct && matchedVariant && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Passo 2: Produto Combinado Automaticamente
            </h2>
            <p className="text-sm text-gray-600">
              Nosso sistema encontrou automaticamente o produto mais adequado para sua unidade e empresa com base nos critérios de matching.
            </p>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Product Information */}
              <div className="md:w-1/3 bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-4">
                  <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.name} 
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-800">{selectedProduct.name}</h3>
                    <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {selectedProduct.category}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">{selectedProduct.description}</p>
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Produto Guarda-chuva</h4>
                  <p className="text-xs text-gray-500">
                    Este é um produto guarda-chuva que representa a categoria geral. O sistema faz o matching para um produto específico de um fornecedor.
                  </p>
                </div>
              </div>
              
              {/* Matching Results */}
              <div className="md:w-2/3 border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-green-50 p-4 border-b border-green-200">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <h3 className="text-lg font-medium text-green-800">Melhor Combinação Encontrada</h3>
                    <span className="ml-auto bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      {matchedVariant.matchScore}% Match
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
                    <div>
                      <h4 className="text-md font-medium text-gray-900">{selectedProduct.name}</h4>
                      <p className="text-sm text-gray-600">Fornecedor: {matchedVariant.supplier}</p>
                    </div>
                    <div className="flex items-center mt-2 md:mt-0">
                      <div className="flex mr-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star}
                            className={`w-4 h-4 ${
                              star <= Math.floor(matchedVariant.supplierRating) 
                                ? 'text-yellow-400 fill-yellow-400' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">{matchedVariant.supplierRating}/5</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="flex items-center mb-1">
                        <DollarSign className="w-4 h-4 text-gray-500 mr-1" />
                        <span className="text-xs font-medium text-gray-500">Preço</span>
                      </div>
                      <p className="text-lg font-semibold">{formatCurrency(matchedVariant.price)}/{matchedVariant.unit}</p>
                      <p className="text-xs text-gray-500">Pedido mínimo: {matchedVariant.minOrder} {matchedVariant.unit}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="flex items-center mb-1">
                        <Truck className="w-4 h-4 text-gray-500 mr-1" />
                        <span className="text-xs font-medium text-gray-500">Entrega</span>
                      </div>
                      <p className="text-md font-medium text-gray-800">{matchedVariant.deliveryTime}</p>
                      <div className="flex items-center mt-1">
                        <span className={`inline-block w-2 h-2 rounded-full ${
                          matchedVariant.stockStatus === "Em estoque" 
                            ? 'bg-green-500' 
                            : 'bg-yellow-500'
                        } mr-1`}></span>
                        <p className="text-xs text-gray-500">{matchedVariant.stockStatus}</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="flex items-center mb-1">
                        <Map className="w-4 h-4 text-gray-500 mr-1" />
                        <span className="text-xs font-medium text-gray-500">Disponibilidade</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {matchedVariant.servedUnits.map((servedUnit, index) => (
                          <span 
                            key={index} 
                            className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                              servedUnit === unit
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {servedUnit}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={addToCart}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Adicionar ao Carrinho
                  </button>
                  
                  <button 
                    className="w-full mt-3 text-sm text-blue-600 hover:text-blue-800"
                    onClick={() => setShowMatchDetails(!showMatchDetails)}
                  >
                    {showMatchDetails ? 'Ocultar detalhes do matching' : 'Ver detalhes do matching'}
                  </button>
                  
                  {showMatchDetails && (
                    <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Critérios de Matching</h4>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <div className="flex items-center justify-center flex-shrink-0 h-5 w-5 rounded-full bg-green-100 text-green-600">
                            <CheckCircle className="h-3 w-3" />
                          </div>
                          <div className="ml-3">
                            <h5 className="text-xs font-medium text-gray-700">Preço mais baixo</h5>
                            <p className="text-xs text-gray-500">
                              Entre os fornecedores disponíveis para sua unidade, este oferece o menor preço.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="flex items-center justify-center flex-shrink-0 h-5 w-5 rounded-full bg-green-100 text-green-600">
                            <CheckCircle className="h-3 w-3" />
                          </div>
                          <div className="ml-3">
                            <h5 className="text-xs font-medium text-gray-700">Compatibilidade de unidade</h5>
                            <p className="text-xs text-gray-500">
                              Este fornecedor atende a unidade {unit}, que é sua unidade atual.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="flex items-center justify-center flex-shrink-0 h-5 w-5 rounded-full bg-green-100 text-green-600">
                            <CheckCircle className="h-3 w-3" />
                          </div>
                          <div className="ml-3">
                            <h5 className="text-xs font-medium text-gray-700">Prioridade manual</h5>
                            <p className="text-xs text-gray-500">
                              Este fornecedor tem prioridade {matchedVariant.priority}/5 definida manualmente no sistema.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Completion */}
      {currentStep === 3 && (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Produto Adicionado ao Carrinho!</h2>
          <p className="text-lg text-gray-600 mb-6">
            O produto foi automaticamente adicionado ao seu carrinho com o fornecedor mais adequado.
          </p>
          <div className="max-w-md mx-auto bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex items-center">
              <img 
                src={selectedProduct.image} 
                alt={selectedProduct.name} 
                className="w-16 h-16 object-cover rounded"
              />
              <div className="ml-3 text-left">
                <h3 className="font-medium text-gray-900">{selectedProduct.name}</h3>
                <p className="text-sm text-gray-600">{matchedVariant.supplier}</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatCurrency(matchedVariant.price)}/{matchedVariant.unit}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Continuar Comprando
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Ver Carrinho
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductMatchingSystem;