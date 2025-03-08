const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const stat = promisify(fs.stat);

// Diretório base para procurar arquivos HTML
const baseDir = path.join(__dirname, 'public/pages');

// Função para verificar se um arquivo é HTML
const isHtmlFile = (filename) => filename.endsWith('.html');

// Função para processar um arquivo HTML
async function processHtmlFile(filePath) {
  try {
    // Ler o conteúdo do arquivo
    const content = await readFile(filePath, 'utf8');
    
    // Verificar se o arquivo contém cabeçalhos
    if (!content.includes('<h1') && !content.includes('<h2') && !content.includes('<h3')) {
      return false;
    }
    
    // Substituir divs que contêm h1, h2, h3 para adicionar class="text-left"
    let newContent = content;
    
    // Padrão para encontrar divs que contêm h1, h2, h3 sem a classe text-left
    const divPattern = /<div>(\s*)<h([1-3])/g;
    newContent = newContent.replace(divPattern, '<div class="text-left">$1<h$2');
    
    // Padrão para encontrar h1, h2, h3 sem a classe text-left
    const headingPattern = /<h([1-3])\s+class="([^"]*)"([^>]*)>/g;
    newContent = newContent.replace(headingPattern, (match, level, classes, rest) => {
      if (!classes.includes('text-left')) {
        return `<h${level} class="${classes} text-left"${rest}>`;
      }
      return match;
    });
    
    // Padrão para encontrar h1, h2, h3 sem nenhuma classe
    const headingNoClassPattern = /<h([1-3])([^c][^>]*|>)/g;
    newContent = newContent.replace(headingNoClassPattern, (match, level, rest) => {
      if (rest.trim() === '>') {
        return `<h${level} class="text-left">`;
      }
      return `<h${level} class="text-left"${rest}`;
    });
    
    // Se o conteúdo foi modificado, escrever de volta no arquivo
    if (newContent !== content) {
      await writeFile(filePath, newContent, 'utf8');
      console.log(`Atualizado: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Erro ao processar ${filePath}:`, error);
    return false;
  }
}

// Função para percorrer diretórios recursivamente
async function processDirectory(dirPath) {
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });
    let updatedFiles = 0;
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        // Processar subdiretório recursivamente
        updatedFiles += await processDirectory(fullPath);
      } else if (isHtmlFile(entry.name)) {
        // Processar arquivo HTML
        const updated = await processHtmlFile(fullPath);
        if (updated) updatedFiles++;
      }
    }
    
    return updatedFiles;
  } catch (error) {
    console.error(`Erro ao processar diretório ${dirPath}:`, error);
    return 0;
  }
}

// Função principal
async function main() {
  console.log('Iniciando atualização de títulos em arquivos HTML...');
  
  try {
    const updatedFiles = await processDirectory(baseDir);
    console.log(`Processo concluído! ${updatedFiles} arquivos foram atualizados.`);
  } catch (error) {
    console.error('Erro durante o processamento:', error);
  }
}

// Executar a função principal
main(); 