/**
 * Script para atualizar automaticamente todas as páginas HTML
 * com o novo layout de scroll independente
 * 
 * Este script:
 * 1. Procura todos os arquivos HTML no diretório public/pages
 * 2. Atualiza a estrutura HTML para usar o novo padrão de layout
 * 3. Adiciona a referência ao arquivo CSS de layout compartilhado
 * 
 * Instruções de uso:
 * 1. Instale as dependências: npm install glob fs-extra
 * 2. Execute: node scripts/update-layout.js
 */

const fs = require('fs-extra');
const glob = require('glob');
const path = require('path');

// Caminho base do projeto
const basePath = path.join(__dirname, '..');

// Função principal
async function updateAllPages() {
  console.log('Iniciando atualização de layout para todas as páginas...');
  
  try {
    // Encontrar todos os arquivos HTML
    const htmlFiles = await findHtmlFiles();
    console.log(`Encontrados ${htmlFiles.length} arquivos HTML para atualizar.`);
    
    // Processar cada arquivo
    for (const file of htmlFiles) {
      await updateHtmlFile(file);
    }
    
    console.log('Atualização concluída com sucesso!');
  } catch (error) {
    console.error('Erro durante a atualização:', error);
  }
}

// Função para encontrar todos os arquivos HTML
function findHtmlFiles() {
  return new Promise((resolve, reject) => {
    glob(`${basePath}/public/pages/**/*.html`, (err, files) => {
      if (err) return reject(err);
      resolve(files);
    });
  });
}

// Função para atualizar um arquivo HTML
async function updateHtmlFile(filePath) {
  try {
    console.log(`Processando: ${path.relative(basePath, filePath)}`);
    
    // Ler o conteúdo do arquivo
    let content = await fs.readFile(filePath, 'utf8');
    
    // Verificar se o arquivo já foi atualizado
    if (content.includes('content-container') || content.includes('sidebar-container')) {
      console.log(`  ↪ Arquivo já atualizado, pulando.`);
      return;
    }
    
    // Adicionar a referência ao CSS de layout
    if (!content.includes('/css/layout.css')) {
      content = content.replace(
        /<link[^>]*styles\.css[^>]*>/,
        '$&\n    <link href="/css/layout.css" rel="stylesheet">'
      );
    }
    
    // Atualizar a estrutura do HTML
    content = content.replace(
      /<div class="flex min-h-screen">/,
      '<div class="main-layout">'
    );
    
    // Envolver a sidebar com div
    content = content.replace(
      /<app-sidebar><\/app-sidebar>/,
      '<div class="sidebar-container">\n        <app-sidebar></app-sidebar>\n    </div>'
    );
    
    // Atualizar a tag main
    content = content.replace(
      /<main class="flex-1 p-8 overflow-y-auto">/,
      '<main class="p-8 content-container">'
    );
    
    // Salvar o arquivo atualizado
    await fs.writeFile(filePath, content, 'utf8');
    console.log(`  ✓ Arquivo atualizado com sucesso.`);
    
  } catch (error) {
    console.error(`  ✗ Erro ao processar ${filePath}:`, error);
  }
}

// Executar o script
updateAllPages(); 