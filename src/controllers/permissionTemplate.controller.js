const PermissionTemplate = require('../models/permissionTemplate.model');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');

// Criar um novo template de permissão
exports.create = async (req, res) => {
  try {
    const { name, description, area, pages, status } = req.body;

    // Validação básica
    if (!name || !area || !pages || !Array.isArray(pages)) {
      return res.status(400).json({
        success: false,
        message: 'Dados incompletos. Nome, área e páginas são obrigatórios.'
      });
    }

    // Gera ID único para o template
    const templateId = `template_${area.toLowerCase()}_${uuidv4().substring(0, 8)}`;

    // Formatar as páginas para o formato do modelo
    const formattedPages = pages.map(page => {
      // Converter as ações do formato { view: true, create: false, ... } para o formato do modelo
      const defaultActions = Object.entries(page.actions).map(([actionType, allowed]) => ({
        actionType,
        allowed
      }));

      // Formatar as seções, se existirem
      const sections = page.sections ? page.sections.map(section => {
        const sectionActions = Object.entries(section.actions).map(([actionType, allowed]) => ({
          actionType,
          allowed
        }));

        return {
          sectionId: section.id,
          sectionName: section.name,
          defaultActions: sectionActions
        };
      }) : [];

      return {
        pageId: page.id,
        pageName: page.name,
        path: page.path,
        defaultActions,
        sections
      };
    });

    // Cria o template
    const newTemplate = await PermissionTemplate.create({
      templateId,
      templateName: name,
      templateDescription: description || '',
      area,
      pages: formattedPages,
      status: status || 'Ativo',
      // Usar um ID fixo temporariamente
      createdBy: '64f0e4d7b7ceec0b3c3a1234' // ID temporário
    });

    res.status(201).json({
      success: true,
      message: 'Template de permissão criado com sucesso',
      data: newTemplate
    });
  } catch (error) {
    console.error('Erro ao criar template de permissão:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar template de permissão',
      error: error.message
    });
  }
};

// Listar todos os templates de permissão
exports.findAll = async (req, res) => {
  try {
    const { area, status } = req.query;
    const filter = {};

    // Filtros opcionais
    if (area) filter.area = area;
    if (status) filter.status = status;

    const templates = await PermissionTemplate.find(filter)
      .populate('createdBy', 'preferredName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: templates.length,
      data: templates
    });
  } catch (error) {
    console.error('Erro ao listar templates de permissão:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar templates de permissão',
      error: error.message
    });
  }
};

// Buscar um template de permissão pelo ID
exports.findOne = async (req, res) => {
  try {
    const { id } = req.params;

    const template = await PermissionTemplate.findOne({
      $or: [
        { _id: id },
        { templateId: id }
      ]
    }).populate('createdBy', 'preferredName email');

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template de permissão não encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Erro ao buscar template de permissão:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar template de permissão',
      error: error.message
    });
  }
};

// Atualizar um template de permissão
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, area, pages, status } = req.body;

    // Validação básica
    if (!name && !description && !area && !pages && !status) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum dado fornecido para atualização'
      });
    }

    // Busca o template
    const template = await PermissionTemplate.findOne({
      $or: [
        { _id: id },
        { templateId: id }
      ]
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template de permissão não encontrado'
      });
    }

    // Formatar as páginas para o formato do modelo, se fornecidas
    let formattedPages;
    if (pages && Array.isArray(pages)) {
      formattedPages = pages.map(page => {
        // Converter as ações do formato { view: true, create: false, ... } para o formato do modelo
        const defaultActions = Object.entries(page.actions).map(([actionType, allowed]) => ({
          actionType,
          allowed
        }));

        // Formatar as seções, se existirem
        const sections = page.sections ? page.sections.map(section => {
          const sectionActions = Object.entries(section.actions).map(([actionType, allowed]) => ({
            actionType,
            allowed
          }));

          return {
            sectionId: section.id,
            sectionName: section.name,
            defaultActions: sectionActions
          };
        }) : [];

        return {
          pageId: page.id,
          pageName: page.name,
          path: page.path,
          defaultActions,
          sections
        };
      });
    }

    // Atualiza os campos
    if (name) template.templateName = name;
    if (description !== undefined) template.templateDescription = description;
    if (area) template.area = area;
    if (formattedPages) template.pages = formattedPages;
    if (status) template.status = status;

    // Salva as alterações
    await template.save();

    res.status(200).json({
      success: true,
      message: 'Template de permissão atualizado com sucesso',
      data: template
    });
  } catch (error) {
    console.error('Erro ao atualizar template de permissão:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar template de permissão',
      error: error.message
    });
  }
};

// Excluir um template de permissão
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    // Busca e remove o template
    const result = await PermissionTemplate.findOneAndDelete({
      $or: [
        { _id: id },
        { templateId: id }
      ]
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Template de permissão não encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Template de permissão excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir template de permissão:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao excluir template de permissão',
      error: error.message
    });
  }
};

// Listar todas as áreas disponíveis
exports.listAreas = async (req, res) => {
  try {
    // Áreas fixas para garantir que funcione
    const areas = ['RH', 'Financeiro', 'Operacional', 'Administrativo', 'TI', 'Marketing', 'Vendas', 'Jurídico'];
    
    // Retornar diretamente o array de áreas, sem o wrapper success/data
    res.status(200).json(areas);
  } catch (error) {
    console.error('Erro ao listar áreas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar áreas',
      error: error.message
    });
  }
};

// Listar todas as páginas do sistema
exports.listSystemPages = async (req, res) => {
  try {
    // Fornecer uma lista estática de páginas para garantir que funcione
    const pages = [
      {
        pageId: 'dashboard',
        pageName: 'Dashboard',
        path: '/pages/dashboard.html'
      },
      {
        pageId: 'users',
        pageName: 'Usuários',
        path: '/pages/account/users.html'
      },
      {
        pageId: 'clients',
        pageName: 'Clientes',
        path: '/pages/clients/clients.html'
      },
      {
        pageId: 'contracts',
        pageName: 'Contratos',
        path: '/pages/contracts/contracts.html'
      },
      {
        pageId: 'invoices',
        pageName: 'Faturas',
        path: '/pages/financial/invoices.html'
      },
      {
        pageId: 'expenses',
        pageName: 'Despesas',
        path: '/pages/financial/expenses.html'
      },
      {
        pageId: 'reports',
        pageName: 'Relatórios',
        path: '/pages/reports/reports.html'
      },
      {
        pageId: 'settings',
        pageName: 'Configurações',
        path: '/pages/settings/settings.html'
      },
      {
        pageId: 'permission_templates',
        pageName: 'Templates de Permissão',
        path: '/pages/config/permission-templates.html'
      },
      {
        pageId: 'reminder_board',
        pageName: 'Quadro de Lembretes',
        path: '/pages/reminder/dash.reminder.html'
      }
    ];
    
    // Retornar diretamente o array de páginas
    res.status(200).json(pages);
  } catch (error) {
    console.error('Erro ao listar páginas do sistema:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar páginas do sistema',
      error: error.message
    });
  }
};

// Função recursiva para escanear diretórios e encontrar páginas HTML
async function scanDirectoryForPages(directory, baseDir = null) {
  if (!baseDir) baseDir = directory;
  
  const pages = [];
  
  try {
    const files = await fs.readdir(directory);
    
    for (const file of files) {
      const filePath = path.join(directory, file);
      const stat = await fs.stat(filePath);
      
      if (stat.isDirectory()) {
        // Recursivamente escanear subdiretórios
        const subPages = await scanDirectoryForPages(filePath, baseDir);
        pages.push(...subPages);
      } else if (file.endsWith('.html')) {
        // Encontrou um arquivo HTML
        const relativePath = filePath.replace(baseDir, '').replace(/\\/g, '/');
        const pagePath = '/pages' + relativePath;
        const pageName = file.replace('.html', '');
        const pageId = pagePath.replace(/\//g, '_').substring(1);
        
        pages.push({
          pageId,
          pageName: formatPageName(pageName),
          path: pagePath
        });
      }
    }
  } catch (error) {
    console.error(`Erro ao escanear diretório ${directory}:`, error);
  }
  
  return pages;
}

// Função para formatar o nome da página
function formatPageName(name) {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
} 