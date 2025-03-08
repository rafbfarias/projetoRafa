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
    
    // Verificar se o arquivo contém ícones com estilo incorreto
    if (!content.includes('rounded-full bg-') || 
        !content.includes('text-') || 
        !content.includes('fa-')) {
      return false;
    }
    
    // Substituir o estilo dos ícones para seguir o padrão do dashboard financeiro
    let newContent = content;
    
    // Padrão para encontrar divs com ícones no estilo antigo (background colorido, texto colorido)
    const iconPattern = /<div class="([^"]*)(p-[0-9]|p-\[[^\]]+\]) rounded-full bg-([^"]*)-([0-9]+) dark:bg-([^"]*)-([0-9]+) text-([^"]*)-([0-9]+) dark:text-([^"]*)-([0-9]+)([^>]*)>/g;
    
    newContent = newContent.replace(iconPattern, (match, prefix, padding, bgColor, bgShade, darkBgColor, darkBgShade, textColor, textShade, darkTextColor, darkTextShade, suffix) => {
      return `<div class="${prefix}${padding} flex items-center justify-center rounded-lg" style="background-color: var(--icon-${bgColor}-bg);"${suffix}>`;
    });
    
    // Padrão para encontrar ícones dentro dessas divs
    const faIconPattern = /<i class="fas? fa-([^"]+)([^>]*)><\/i>/g;
    
    newContent = newContent.replace(faIconPattern, (match, iconName, rest) => {
      if (rest.includes('style=')) {
        return match; // Já tem estilo definido
      }
      if (match.includes('text-xl') || match.includes('text-lg') || match.includes('text-sm')) {
        return `<i class="fas fa-${iconName} ${rest}" style="color: var(--icon-clients-text);"></i>`;
      }
      return `<i class="fas fa-${iconName} text-xl" style="color: var(--icon-clients-text);"${rest}></i>`;
    });
    
    // Padrão para encontrar divs com ícones no estilo antigo (versão simplificada)
    const simpleIconPattern = /<div class="([^"]*)(p-[0-9]|p-\[[^\]]+\]) rounded-full bg-([^"]*)-([0-9]+)([^>]*)>/g;
    
    newContent = newContent.replace(simpleIconPattern, (match, prefix, padding, bgColor, bgShade, suffix) => {
      return `<div class="${prefix}${padding} flex items-center justify-center rounded-lg" style="background-color: var(--icon-${bgColor}-bg);"${suffix}>`;
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
  console.log('Iniciando atualização de ícones em arquivos HTML...');
  
  try {
    const updatedFiles = await processDirectory(baseDir);
    console.log(`Processo concluído! ${updatedFiles} arquivos foram atualizados.`);
  } catch (error) {
    console.error('Erro durante o processamento:', error);
  }
}

// Executar a função principal
main(); 