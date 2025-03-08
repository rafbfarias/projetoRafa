/**
 * Reminder Board - Script principal
 * 
 * Este script controla todas as funcionalidades do quadro de lembretes:
 * - Criação, edição e exclusão de notas
 * - Funcionalidade drag and drop para posicionar as notas
 * - Armazenamento local das notas usando localStorage
 * - Filtragem e ordenação das notas
 */

// Variáveis globais
let notes = [];
let currentNoteId = null;
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;
let currentNote = null;

/**
 * Inicializa o Reminder Board
 */
function initReminderBoard() {
    // Carregar notas do localStorage
    loadNotes();
    
    // Inicializar event listeners
    setupEventListeners();
    
    // Mostrar ou esconder mensagem de board vazio
    updateEmptyBoardMessage();
    
    // Popular selects com dados de exemplo (em um projeto real, isso viria do banco de dados)
    populateReferenceElements();
}

/**
 * Configura todos os event listeners
 */
function setupEventListeners() {
    // Botões de adicionar nota
    document.getElementById('addNoteBtn').addEventListener('click', openNewNoteModal);
    document.getElementById('addInitialNoteBtn').addEventListener('click', openNewNoteModal);
    
    // Botões nos modais
    document.getElementById('saveNoteBtn').addEventListener('click', saveNote);
    document.getElementById('updateNoteBtn').addEventListener('click', updateNote);
    document.getElementById('confirmDeleteBtn').addEventListener('click', deleteCurrentNote);
    
    // Fechar modais
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });
    
    // Mudar tipo de nota
    document.getElementById('noteType').addEventListener('change', handleNoteTypeChange);
    document.getElementById('editNoteType').addEventListener('change', handleEditNoteTypeChange);
    
    // Seleção de cores no modal
    setupColorSelectionEvents();
    
    // Dropdown de filtro
    document.getElementById('filterDropdownButton').addEventListener('click', toggleFilterDropdown);
    
    // Fechar dropdowns ao clicar fora
    document.addEventListener('click', handleOutsideClick);
    
    // Event listeners para o board
    const board = document.getElementById('board');
    board.addEventListener('mousedown', handleBoardMouseDown);
    document.addEventListener('mousemove', handleDocumentMouseMove);
    document.addEventListener('mouseup', handleDocumentMouseUp);
}

/**
 * Carrega as notas do localStorage
 */
function loadNotes() {
    const savedNotes = localStorage.getItem('reminderNotes');
    if (savedNotes) {
        notes = JSON.parse(savedNotes);
        renderNotes();
    }
}

/**
 * Salva as notas no localStorage
 */
function saveNotesToStorage() {
    localStorage.setItem('reminderNotes', JSON.stringify(notes));
}

/**
 * Renderiza todas as notas no board
 */
function renderNotes() {
    const board = document.getElementById('board');
    
    // Limpar o board
    while (board.firstChild) {
        board.removeChild(board.firstChild);
    }
    
    // Renderizar cada nota
    notes.forEach(note => {
        const noteElement = createNoteElement(note);
        board.appendChild(noteElement);
    });
    
    // Atualizar mensagem de board vazio
    updateEmptyBoardMessage();
}

/**
 * Cria um elemento DOM para uma nota
 */
function createNoteElement(note) {
    const noteElement = document.createElement('div');
    noteElement.className = `note absolute bg-white dark:bg-gray-700 shadow-lg rounded-lg p-4 w-64 note-color-${note.color} note-appear`;
    noteElement.style.top = `${note.posY}px`;
    noteElement.style.left = `${note.posX}px`;
    noteElement.dataset.id = note.id;
    noteElement.dataset.type = note.type;
    
    // Mapear tipos para labels e cores
    const typeLabels = {
        'task': 'Tarefa',
        'user': 'Usuário',
        'contract': 'Contrato',
        'expense': 'Despesa',
        'revenue': 'Receita'
    };
    
    const typeColors = {
        'task': 'bg-gray-500',
        'user': 'bg-blue-500',
        'contract': 'bg-purple-500',
        'expense': 'bg-red-500',
        'revenue': 'bg-green-500'
    };
    
    // Mapear prioridades para labels e cores
    const priorityLabels = {
        'low': 'Baixa',
        'medium': 'Média',
        'high': 'Alta'
    };
    
    const priorityColors = {
        'low': 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400',
        'medium': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400',
        'high': 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
    };
    
    // Construir o HTML da nota
    noteElement.innerHTML = `
        <div class="note-header flex justify-between items-center mb-2">
            <div class="note-type px-2 py-1 rounded text-xs font-semibold text-white ${typeColors[note.type]}">${typeLabels[note.type]}</div>
            <div class="note-actions flex space-x-1">
                <button class="note-edit text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="note-delete text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        <div class="note-content">
            <h3 class="font-medium text-gray-800 dark:text-white mb-1">${note.title}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-300">${note.content}</p>
        </div>
        <div class="note-footer mt-3 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
            <span class="note-date">${formatDate(note.date)}</span>
            <span class="note-priority px-2 py-1 rounded ${priorityColors[note.priority]}">${priorityLabels[note.priority]}</span>
        </div>
    `;
    
    // Adicionar tooltip de referência se houver um elementId
    if (note.elementId) {
        const referenceTooltip = document.createElement('div');
        referenceTooltip.className = 'reference-tooltip';
        referenceTooltip.innerHTML = `
            <a href="#" class="reference-link" data-element-id="${note.elementId}" data-element-type="${note.type}">
                <i class="fas fa-external-link-alt"></i>
            </a>
        `;
        noteElement.appendChild(referenceTooltip);
        
        // Adicionar event listener para o link de referência
        setTimeout(() => {
            const referenceLink = noteElement.querySelector('.reference-link');
            if (referenceLink) {
                referenceLink.addEventListener('click', handleReferenceClick);
            }
        }, 0);
    }
    
    // Adicionar event listeners para os botões de edição e exclusão
    setTimeout(() => {
        const editButton = noteElement.querySelector('.note-edit');
        const deleteButton = noteElement.querySelector('.note-delete');
        
        if (editButton) {
            editButton.addEventListener('click', (event) => {
                event.stopPropagation();
                openEditNoteModal(note.id);
            });
        }
        
        if (deleteButton) {
            deleteButton.addEventListener('click', (event) => {
                event.stopPropagation();
                openDeleteNoteModal(note.id);
            });
        }
    }, 0);
    
    return noteElement;
}

/**
 * Formata uma data para exibição
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

/**
 * Atualiza a mensagem de board vazio
 */
function updateEmptyBoardMessage() {
    const emptyBoard = document.getElementById('empty-board');
    
    if (notes.length === 0) {
        emptyBoard.classList.remove('hidden');
    } else {
        emptyBoard.classList.add('hidden');
    }
}

/**
 * Manipula o evento de clique em uma referência de elemento
 */
function handleReferenceClick(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const elementId = event.currentTarget.dataset.elementId;
    const elementType = event.currentTarget.dataset.elementType;
    
    // Aqui você redirecionaria para a página do elemento
    // Em um projeto real, isso seria uma rota específica
    alert(`Navegar para ${elementType} com ID: ${elementId}`);
    
    // Exemplos de redirecionamento:
    // if (elementType === 'user') window.location.href = `/users/detail/${elementId}`;
    // if (elementType === 'contract') window.location.href = `/contracts/detail/${elementId}`;
    // etc.
}

/**
 * Abre o modal para criar uma nova nota
 */
function openNewNoteModal() {
    // Resetar o formulário
    document.getElementById('newNoteForm').reset();
    
    // Esconder o container de referência inicialmente
    document.getElementById('referenceElementContainer').classList.add('hidden');
    
    // Mostrar o modal
    document.getElementById('newNoteModal').classList.remove('hidden');
    
    // Focar no campo de título
    document.getElementById('noteTitle').focus();
    
    // Resetar a seleção de cor
    document.querySelectorAll('input[name="noteColor"]')[0].checked = true;
    updateColorSelection('noteColor');
}

/**
 * Abre o modal para editar uma nota existente
 */
function openEditNoteModal(noteId) {
    // Encontrar a nota pelo ID
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    
    // Armazenar o ID da nota atual
    currentNoteId = noteId;
    
    // Preencher o formulário
    document.getElementById('editNoteId').value = note.id;
    document.getElementById('editNoteType').value = note.type;
    document.getElementById('editNoteTitle').value = note.title;
    document.getElementById('editNoteContent').value = note.content;
    document.getElementById('editNotePriority').value = note.priority;
    
    // Definir a cor
    document.querySelectorAll('input[name="editNoteColor"]').forEach(input => {
        if (input.value === note.color) {
            input.checked = true;
        }
    });
    updateColorSelection('editNoteColor');
    
    // Mostrar/esconder container de referência
    if (note.type !== 'task') {
        document.getElementById('editReferenceElementContainer').classList.remove('hidden');
        populateReferenceElements(note.type, 'edit');
        
        // Definir o elemento de referência, se houver
        if (note.elementId) {
            document.getElementById('editReferenceElement').value = note.elementId;
        }
    } else {
        document.getElementById('editReferenceElementContainer').classList.add('hidden');
    }
    
    // Mostrar o modal
    document.getElementById('editNoteModal').classList.remove('hidden');
    
    // Focar no campo de título
    document.getElementById('editNoteTitle').focus();
}

/**
 * Abre o modal de confirmação para excluir uma nota
 */
function openDeleteNoteModal(noteId) {
    currentNoteId = noteId;
    document.getElementById('deleteNoteModal').classList.remove('hidden');
}

/**
 * Fecha todos os modais
 */
function closeAllModals() {
    document.getElementById('newNoteModal').classList.add('hidden');
    document.getElementById('editNoteModal').classList.add('hidden');
    document.getElementById('deleteNoteModal').classList.add('hidden');
    
    // Resetar nota atual
    currentNoteId = null;
}

/**
 * Salva uma nova nota
 */
function saveNote() {
    // Obter valores do formulário
    const type = document.getElementById('noteType').value;
    const title = document.getElementById('noteTitle').value.trim();
    const content = document.getElementById('noteContent').value.trim();
    const priority = document.getElementById('notePriority').value;
    const color = document.querySelector('input[name="noteColor"]:checked').value;
    
    // Validação básica
    if (!title) {
        alert('Por favor, informe um título para a nota.');
        return;
    }
    
    // Criar ID único
    const id = 'note-' + Date.now();
    
    // Obter elemento de referência, se aplicável
    let elementId = null;
    if (type !== 'task') {
        elementId = document.getElementById('referenceElement').value;
    }
    
    // Definir posição aleatória no board
    const board = document.getElementById('board');
    const boardRect = board.getBoundingClientRect();
    const posX = Math.random() * (boardRect.width - 300) + 20;
    const posY = Math.random() * (boardRect.height - 200) + 20;
    
    // Criar objeto da nota
    const newNote = {
        id,
        type,
        title,
        content,
        priority,
        color,
        elementId,
        posX,
        posY,
        date: new Date().toISOString()
    };
    
    // Adicionar ao array e salvar
    notes.push(newNote);
    saveNotesToStorage();
    
    // Renderizar notas
    renderNotes();
    
    // Fechar modal
    closeAllModals();
}

/**
 * Atualiza uma nota existente
 */
function updateNote() {
    if (!currentNoteId) return;
    
    // Encontrar o índice da nota
    const noteIndex = notes.findIndex(n => n.id === currentNoteId);
    if (noteIndex === -1) return;
    
    // Obter valores do formulário
    const type = document.getElementById('editNoteType').value;
    const title = document.getElementById('editNoteTitle').value.trim();
    const content = document.getElementById('editNoteContent').value.trim();
    const priority = document.getElementById('editNotePriority').value;
    const color = document.querySelector('input[name="editNoteColor"]:checked').value;
    
    // Validação básica
    if (!title) {
        alert('Por favor, informe um título para a nota.');
        return;
    }
    
    // Obter elemento de referência, se aplicável
    let elementId = null;
    if (type !== 'task') {
        elementId = document.getElementById('editReferenceElement').value;
    }
    
    // Atualizar objeto da nota
    notes[noteIndex] = {
        ...notes[noteIndex],
        type,
        title,
        content,
        priority,
        color,
        elementId
    };
    
    // Salvar e renderizar
    saveNotesToStorage();
    renderNotes();
    
    // Fechar modal
    closeAllModals();
}

/**
 * Exclui a nota atual
 */
function deleteCurrentNote() {
    if (!currentNoteId) return;
    
    // Filtrar para remover a nota
    notes = notes.filter(note => note.id !== currentNoteId);
    
    // Salvar e renderizar
    saveNotesToStorage();
    renderNotes();
    
    // Fechar modal
    closeAllModals();
}

/**
 * Alterna a visibilidade do dropdown de filtro
 */
function toggleFilterDropdown() {
    const dropdown = document.getElementById('filterDropdown');
    dropdown.classList.toggle('hidden');
}

/**
 * Manipula cliques fora dos dropdowns e modais
 */
function handleOutsideClick(event) {
    // Fechar dropdown de filtro
    const filterButton = document.getElementById('filterDropdownButton');
    const filterDropdown = document.getElementById('filterDropdown');
    
    if (!filterButton.contains(event.target) && !filterDropdown.contains(event.target)) {
        filterDropdown.classList.add('hidden');
    }
    
    // Não fechar modais ao clicar dentro deles
    const modals = [
        document.getElementById('newNoteModal'),
        document.getElementById('editNoteModal'),
        document.getElementById('deleteNoteModal')
    ];
    
    modals.forEach(modal => {
        if (!modal.classList.contains('hidden')) {
            const modalContent = modal.querySelector('div:first-child');
            if (modal.contains(event.target) && !modalContent.contains(event.target)) {
                closeAllModals();
            }
        }
    });
}

/**
 * Manipula a mudança de tipo de nota
 */
function handleNoteTypeChange() {
    const type = document.getElementById('noteType').value;
    const referenceContainer = document.getElementById('referenceElementContainer');
    
    if (type === 'task') {
        referenceContainer.classList.add('hidden');
    } else {
        referenceContainer.classList.remove('hidden');
        populateReferenceElements(type);
    }
}

/**
 * Manipula a mudança de tipo de nota na edição
 */
function handleEditNoteTypeChange() {
    const type = document.getElementById('editNoteType').value;
    const referenceContainer = document.getElementById('editReferenceElementContainer');
    
    if (type === 'task') {
        referenceContainer.classList.add('hidden');
    } else {
        referenceContainer.classList.remove('hidden');
        populateReferenceElements(type, 'edit');
    }
}

/**
 * Configura os event listeners para seleção de cores
 */
function setupColorSelectionEvents() {
    // Para o modal de nova nota
    document.querySelectorAll('input[name="noteColor"]').forEach(input => {
        input.addEventListener('change', () => updateColorSelection('noteColor'));
    });
    
    // Para o modal de edição
    document.querySelectorAll('input[name="editNoteColor"]').forEach(input => {
        input.addEventListener('change', () => updateColorSelection('editNoteColor'));
    });
    
    // Inicialização
    updateColorSelection('noteColor');
    updateColorSelection('editNoteColor');
}

/**
 * Atualiza a UI de seleção de cores
 */
function updateColorSelection(inputName) {
    const selectedInput = document.querySelector(`input[name="${inputName}"]:checked`);
    if (!selectedInput) return;
    
    // Remover classe 'selected' de todas as opções
    document.querySelectorAll(`input[name="${inputName}"]`).forEach(input => {
        input.closest('.color-option').classList.remove('selected');
    });
    
    // Adicionar classe 'selected' à opção selecionada
    selectedInput.closest('.color-option').classList.add('selected');
}

/**
 * Popula o select de elementos de referência
 */
function populateReferenceElements(type = 'user', mode = 'new') {
    const selectId = mode === 'edit' ? 'editReferenceElement' : 'referenceElement';
    const select = document.getElementById(selectId);
    
    // Limpar opções existentes
    select.innerHTML = '<option value="">Selecione um elemento...</option>';
    
    // Dados de exemplo baseados no tipo
    let options = [];
    switch (type) {
        case 'user':
            options = [
                { id: 'user-1', label: 'Ana Silva - ana.silva@exemplo.com' },
                { id: 'user-2', label: 'Bruno Santos - bruno.santos@exemplo.com' },
                { id: 'user-3', label: 'Carla Oliveira - carla.oliveira@exemplo.com' }
            ];
            break;
        case 'contract':
            options = [
                { id: 'contract-1', label: 'Contrato #2025-001 - Ana Silva' },
                { id: 'contract-2', label: 'Contrato #2025-002 - Bruno Santos' },
                { id: 'contract-3', label: 'Contrato #2025-003 - Carla Oliveira' }
            ];
            break;
        case 'expense':
            options = [
                { id: 'expense-1', label: 'Despesa #EXP-2025-001 - Aluguel Matosinhos' },
                { id: 'expense-2', label: 'Despesa #EXP-2025-002 - Fornecedor Café' },
                { id: 'expense-3', label: 'Despesa #EXP-2025-003 - Manutenção Porto' }
            ];
            break;
        case 'revenue':
            options = [
                { id: 'revenue-1', label: 'Receita #FAT-2025-001 - Matosinhos (05/03/2025)' },
                { id: 'revenue-2', label: 'Receita #FAT-2025-002 - Porto (03/03/2025)' },
                { id: 'revenue-3', label: 'Receita #FAT-2025-003 - Matosinhos (01/03/2025)' }
            ];
            break;
    }
    
    // Adicionar opções ao select
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.id;
        optionElement.textContent = option.label;
        select.appendChild(optionElement);
    });
}

/**
 * Manipula o mousedown no board para iniciar arrastamento
 */
function handleBoardMouseDown(event) {
    // Verificar se o clique foi em uma nota
    let noteElement = event.target.closest('.note');
    if (!noteElement) return;
    
    // Prevenir comportamento padrão
    event.preventDefault();
    
    // Iniciar arrasto
    isDragging = true;
    currentNote = noteElement;
    
    // Calcular offset do mouse relativo à nota
    const noteRect = noteElement.getBoundingClientRect();
    dragOffsetX = event.clientX - noteRect.left;
    dragOffsetY = event.clientY - noteRect.top;
    
    // Adicionar classe para estilo de arrasto
    noteElement.classList.add('dragging');
}

/**
 * Manipula o mousemove no documento para arrastar a nota
 */
function handleDocumentMouseMove(event) {
    if (!isDragging || !currentNote) return;
    
    // Calcular nova posição
    const board = document.getElementById('board');
    const boardRect = board.getBoundingClientRect();
    const boardScrollTop = board.scrollTop;
    const boardScrollLeft = board.scrollLeft;
    
    let newX = event.clientX - boardRect.left - dragOffsetX + boardScrollLeft;
    let newY = event.clientY - boardRect.top - dragOffsetY + boardScrollTop;
    
    // Limitar às bordas do board
    newX = Math.max(0, Math.min(newX, boardRect.width - currentNote.offsetWidth));
    newY = Math.max(0, Math.min(newY, board.scrollHeight - currentNote.offsetHeight));
    
    // Atualizar posição da nota
    currentNote.style.left = `${newX}px`;
    currentNote.style.top = `${newY}px`;
}

/**
 * Manipula o mouseup no documento para finalizar arrasto
 */
function handleDocumentMouseUp() {
    if (!isDragging || !currentNote) return;
    
    // Finalizar arrasto
    isDragging = false;
    
    // Remover classe de arrasto
    currentNote.classList.remove('dragging');
    
    // Atualizar posição da nota no array
    const noteId = currentNote.dataset.id;
    const noteIndex = notes.findIndex(n => n.id === noteId);
    if (noteIndex !== -1) {
        notes[noteIndex].posX = parseInt(currentNote.style.left);
        notes[noteIndex].posY = parseInt(currentNote.style.top);
        
        // Salvar no localStorage
        saveNotesToStorage();
    }
    
    // Limpar referência
    currentNote = null;
}

/**
 * Função auxiliar para criar um shortcut a partir de um elemento do sistema
 * Esta função seria chamada a partir de outras páginas do sistema
 */
function createNoteFromElement(elementType, elementId, elementTitle, elementContent) {
    // Criar ID único
    const id = 'note-' + Date.now();
    
    // Definir posição aleatória no board
    const posX = Math.random() * 500 + 50;
    const posY = Math.random() * 300 + 50;
    
    // Criar objeto da nota
    const newNote = {
        id,
        type: elementType,
        title: elementTitle,
        content: elementContent,
        priority: 'medium',
        color: 'yellow',
        elementId,
        posX,
        posY,
        date: new Date().toISOString()
    };
    
    // Carregar notas existentes
    let existingNotes = [];
    const savedNotes = localStorage.getItem('reminderNotes');
    if (savedNotes) {
        existingNotes = JSON.parse(savedNotes);
    }
    
    // Adicionar nova nota
    existingNotes.push(newNote);
    
    // Salvar de volta no localStorage
    localStorage.setItem('reminderNotes', JSON.stringify(existingNotes));
    
    // Redirecionar para o Reminder Board
    window.location.href = '/pages/reminder/dash.reminder.html';
}

// Expor função para uso externo
window.createNoteFromElement = createNoteFromElement;