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
let panzoom = null;

/**
 * Inicializa o Reminder Board
 */
function initReminderBoard() {
    console.log('Inicializando Reminder Board');
    
    // Inicializar o zoom
    initializePanZoom();
    
    // Carregar notas do localStorage
    loadNotes();
    
    // Inicializar event listeners
    setupEventListeners();
    
    // Mostrar ou esconder mensagem de board vazio
    updateEmptyBoardMessage();
    
    // Popular selects com dados de exemplo
    populateReferenceElements();

    // Inicializar interatividade das notas
    initializeInteractJS();
    
    console.log('Reminder Board inicializado com sucesso');
}

/**
 * Inicializa o PanZoom para controle de zoom do board
 */
function initializePanZoom() {
    const board = document.getElementById('board');
    panzoom = Panzoom(board, {
        maxScale: 5,
        minScale: 0.1,
        contain: 'outside',
        startScale: 1
    });

    // Adicionar event listeners para os botões de zoom
    document.getElementById('zoomInBtn').addEventListener('click', () => {
        panzoom.zoomIn();
    });

    document.getElementById('zoomOutBtn').addEventListener('click', () => {
        panzoom.zoomOut();
    });

    document.getElementById('resetZoomBtn').addEventListener('click', () => {
        panzoom.reset();
    });

    // Permitir zoom com a roda do mouse
    board.addEventListener('wheel', (event) => {
        if (event.ctrlKey) {
            event.preventDefault();
            const delta = event.deltaY;
            if (delta > 0) {
                panzoom.zoomOut();
            } else {
                panzoom.zoomIn();
            }
        }
    });
}

/**
 * Inicializa o Interact.js para drag, drop e resize
 */
function initializeInteractJS() {
    // Configurar interatividade para cards
    interact('.reminder-card')
        .draggable({
            inertia: true,
            modifiers: [
                interact.modifiers.restrictRect({
                    restriction: 'parent',
                    endOnly: true
                })
            ],
            autoScroll: true,
            listeners: {
                start: function(event) {
                    event.target.classList.add('dragging');
                },
                move: dragMoveListener,
                end: function(event) {
                    event.target.classList.remove('dragging');
                    // Salvar a nova posição
                    const noteId = event.target.dataset.id;
                    const noteIndex = notes.findIndex(n => n.id === noteId);
                    if (noteIndex !== -1) {
                        notes[noteIndex].posX = parseFloat(event.target.getAttribute('data-x')) || 0;
                        notes[noteIndex].posY = parseFloat(event.target.getAttribute('data-y')) || 0;
                        saveNotesToStorage();
                    }
                }
            }
        })
        .resizable({
            edges: { right: true, bottom: true, left: false, top: false },
            inertia: true,
            modifiers: [
                interact.modifiers.restrictSize({
                    min: { width: 250, height: 150 }
                })
            ],
            listeners: {
                move: resizeMoveListener
            }
        });

    // Configurar interatividade para clusters
    interact('.cluster')
        .draggable({
            inertia: true,
            modifiers: [
                interact.modifiers.restrictRect({
                    restriction: 'parent',
                    endOnly: true
                })
            ],
            listeners: {
                move: dragMoveListener
            }
        })
        .resizable({
            edges: { right: true, bottom: true, left: false, top: false },
            modifiers: [
                interact.modifiers.restrictSize({
                    min: { width: 300, height: 200 }
                })
            ],
            listeners: {
                move: resizeMoveListener
            }
        })
        .dropzone({
            accept: '.reminder-card',
            overlap: 0.75,
            ondropactivate: function(event) {
                event.target.classList.add('drop-target');
            },
            ondropdeactivate: function(event) {
                event.target.classList.remove('drop-target');
            },
            ondrop: function(event) {
                const card = event.relatedTarget;
                const cluster = event.target;
                cluster.appendChild(card);
            }
        });
}

/**
 * Listener para movimento de drag
 */
function dragMoveListener(event) {
    const target = event.target;
    const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
    const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    target.style.transform = `translate(${x}px, ${y}px)`;
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
}

/**
 * Listener para movimento de resize
 */
function resizeMoveListener(event) {
    const target = event.target;
    let x = (parseFloat(target.getAttribute('data-x')) || 0);
    let y = (parseFloat(target.getAttribute('data-y')) || 0);

    target.style.width = event.rect.width + 'px';
    target.style.height = event.rect.height + 'px';

    x += event.deltaRect.left;
    y += event.deltaRect.top;

    target.style.transform = `translate(${x}px, ${y}px)`;
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
}

/**
 * Cria um novo cluster
 */
function createCluster() {
    const name = document.getElementById('clusterName').value.trim();
    if (!name) {
        showToast('error', 'Erro', 'Por favor, informe um nome para o cluster');
        return;
    }

    const cluster = document.createElement('div');
    cluster.className = 'cluster';
    cluster.innerHTML = `
        <div class="cluster-header">
            <h3>${name}</h3>
            <button class="delete-cluster">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    // Posicionar o cluster no centro do board visível
    const board = document.getElementById('board');
    const boardRect = board.getBoundingClientRect();
    const x = (boardRect.width / 2) - 150;
    const y = (boardRect.height / 2) - 100;

    cluster.style.transform = `translate(${x}px, ${y}px)`;
    cluster.setAttribute('data-x', x);
    cluster.setAttribute('data-y', y);

    board.appendChild(cluster);
    closeClusterModal();
}

/**
 * Configura todos os event listeners
 */
function setupEventListeners() {
    console.log('Configurando event listeners');
    
    try {
        // Botão de novo lembrete
        const newNoteBtn = document.getElementById('newNoteBtn');
        if (newNoteBtn) {
            console.log('Botão de novo lembrete encontrado');
            newNoteBtn.addEventListener('click', function(e) {
                e.preventDefault(); // Prevenir comportamento padrão
                console.log('Botão de novo lembrete clicado');
                const modal = document.getElementById('newNoteModal');
                if (modal) {
                    console.log('Abrindo modal');
                    modal.classList.remove('hidden');
                } else {
                    console.error('Modal não encontrado');
                }
            });
        }

        // Botão de salvar nota
        const saveNoteBtn = document.getElementById('saveNoteBtn');
        if (saveNoteBtn) {
            console.log('Botão de salvar nota encontrado');
            saveNoteBtn.addEventListener('click', function(e) {
                e.preventDefault(); // Prevenir comportamento padrão
                console.log('Botão de salvar nota clicado');
                saveNote();
            });
        }

        // Botão de cancelar
        const cancelNoteBtn = document.getElementById('cancelNoteBtn');
        if (cancelNoteBtn) {
            cancelNoteBtn.addEventListener('click', function(e) {
                e.preventDefault(); // Prevenir comportamento padrão
                console.log('Botão de cancelar clicado');
                document.getElementById('newNoteModal').classList.add('hidden');
            });
        }

        // Botões para fechar modais
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault(); // Prevenir comportamento padrão
                console.log('Botão fechar modal clicado');
                // Encontrar o modal pai
                let modal = this.closest('.modal');
                if (modal) modal.classList.add('hidden');
            });
        });
        
        // Botão novo cluster
        const newClusterBtn = document.getElementById('newClusterBtn');
        if (newClusterBtn) {
            newClusterBtn.addEventListener('click', function() {
                const modal = document.getElementById('clusterModal');
                if (modal) modal.classList.remove('hidden');
            });
        }

        // Mudar tipo de nota
        const noteType = document.getElementById('noteType');
        if (noteType) {
            noteType.addEventListener('change', handleNoteTypeChange);
        }
        
        const editNoteType = document.getElementById('editNoteType');
        if (editNoteType) {
            editNoteType.addEventListener('change', handleEditNoteTypeChange);
        }
        
        // Seleção de cores no modal
        setupColorSelectionEvents();
        
        // Event listeners para o board
        const board = document.getElementById('board');
        if (board) {
            board.addEventListener('mousedown', handleBoardMouseDown);
        }
        
        document.addEventListener('mousemove', handleDocumentMouseMove);
        document.addEventListener('mouseup', handleDocumentMouseUp);
        
    } catch (error) {
        console.error('Erro ao configurar event listeners:', error);
    }
}

/**
 * Carrega as notas do localStorage
 */
function loadNotes() {
    console.log('Carregando notas do localStorage');
    const savedNotes = localStorage.getItem('reminderNotes');
    
    if (savedNotes) {
        try {
            notes = JSON.parse(savedNotes);
            console.log('Notas carregadas com sucesso:', notes.length);
            renderNotes();
        } catch (error) {
            console.error('Erro ao carregar notas:', error);
            notes = [];
            renderNotes();
        }
    } else {
        console.log('Nenhuma nota encontrada no localStorage');
        notes = [];
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
    console.log('Renderizando notas. Total:', notes.length);
    const board = document.getElementById('board');
    
    // Limpar o board, mas manter a mensagem de board vazio
    const emptyBoard = document.getElementById('empty-board');
    const emptyBoardClone = emptyBoard ? emptyBoard.cloneNode(true) : null;
    
    // Limpar o board
    while (board.firstChild) {
        board.removeChild(board.firstChild);
    }
    
    // Adicionar de volta a mensagem de board vazio
    if (emptyBoardClone) {
        board.appendChild(emptyBoardClone);
    }
    
    // Renderizar cada nota
    if (notes.length > 0) {
        console.log('Renderizando', notes.length, 'notas');
        notes.forEach(note => {
            try {
                const noteElement = createNoteElement(note);
                board.appendChild(noteElement);
                console.log('Nota renderizada:', note.id, note.title);
            } catch (error) {
                console.error('Erro ao renderizar nota:', note.id, error);
            }
        });
    } else {
        console.log('Nenhuma nota para renderizar');
    }
    
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
    console.log('Abrindo modal de nova nota');
    const modal = document.getElementById('newNoteModal');
    if (modal) {
        modal.classList.remove('hidden');
        // Resetar o formulário
        const form = document.getElementById('newNoteForm');
        if (form) form.reset();
        // Focar no título
        const titleInput = document.getElementById('noteTitle');
        if (titleInput) titleInput.focus();
        // Resetar a seleção de cor
        const colorInputs = document.querySelectorAll('input[name="noteColor"]');
        if (colorInputs.length > 0) {
            colorInputs[0].checked = true;
            updateColorSelection('noteColor');
        }
    } else {
        console.error('Modal não encontrado!');
    }
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
 * Salva uma nova nota
 */
function saveNote() {
    console.log('Executando função saveNote()');
    
    try {
        const title = document.getElementById('noteTitle').value.trim();
        const content = document.getElementById('noteContent').value.trim();
        const type = document.getElementById('noteType').value;
        const priority = document.getElementById('notePriority').value;
        const color = document.querySelector('input[name="noteColor"]:checked')?.value || 'yellow';

        if (!title) {
            alert('Por favor, informe um título para a nota');
            return;
        }

        // Criar nova nota
        const newNote = {
            id: 'note-' + Date.now(),
            title,
            content,
            type,
            priority,
            color,
            posX: Math.random() * 300,
            posY: Math.random() * 300,
            date: new Date().toISOString()
        };

        console.log('Nova nota criada:', newNote);

        // Adicionar ao array de notas
        notes.push(newNote);
        
        // Salvar no localStorage
        saveNotesToStorage();
        
        // Renderizar notas
        renderNotes();
        
        // Fechar modal
        const modal = document.getElementById('newNoteModal');
        if (modal) {
            modal.classList.add('hidden');
            console.log('Modal fechado após salvar');
        }
        
        // Mostrar mensagem de sucesso
        alert('Nota criada com sucesso!');
        
        // Verificar se as notas foram salvas corretamente
        const savedNotes = localStorage.getItem('reminderNotes');
        console.log('Notas salvas no localStorage:', savedNotes);
        
        // Verificar se o board está vazio
        const board = document.getElementById('board');
        console.log('Conteúdo do board após renderização:', board.innerHTML);
        
    } catch (error) {
        console.error('Erro ao salvar nota:', error);
        alert('Erro ao salvar nota: ' + error.message);
    }
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
    const modal = document.getElementById('editNoteModal');
    if (modal) modal.classList.add('hidden');
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
    const modal = document.getElementById('deleteNoteModal');
    if (modal) modal.classList.add('hidden');
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

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, inicializando Reminder Board');
    
    // Adicionar um listener direto para o botão como backup
    const newNoteBtn = document.getElementById('newNoteBtn');
    if (newNoteBtn) {
        console.log('Adicionando listener direto ao botão Novo Lembrete');
        newNoteBtn.onclick = function() {
            console.log('Botão Novo Lembrete clicado diretamente');
            const modal = document.getElementById('newNoteModal');
            if (modal) {
                modal.classList.remove('hidden');
            } else {
                console.error('Modal não encontrado (onclick direto)');
            }
        };
    } else {
        console.error('Botão Novo Lembrete não encontrado para onclick direto');
    }
    
    try {
        initReminderBoard();
    } catch (error) {
        console.error('Erro ao inicializar Reminder Board:', error);
    }
    
    // Verificar se os elementos críticos existem
    const criticalElements = [
        { id: 'newNoteBtn', name: 'Botão Novo Lembrete' },
        { id: 'newNoteModal', name: 'Modal Nova Nota' },
        { id: 'saveNoteBtn', name: 'Botão Salvar Nota' }
    ];
    
    criticalElements.forEach(element => {
        const el = document.getElementById(element.id);
        console.log(`${element.name} (${element.id}): ${el ? 'Encontrado' : 'NÃO ENCONTRADO'}`);
    });
});

function showToast(type, title, message) {
    // Por enquanto, vamos usar um alert simples
    alert(`${title}: ${message}`);
    // Em uma implementação real, você usaria um sistema de notificações mais elegante
}

/**
 * Função para depuração que pode ser chamada do console
 */
function debugReminderBoard() {
    console.log('=== DEBUG REMINDER BOARD ===');
    console.log('Notas em memória:', notes);
    
    const savedNotes = localStorage.getItem('reminderNotes');
    console.log('Notas no localStorage:', savedNotes);
    
    if (savedNotes) {
        try {
            const parsedNotes = JSON.parse(savedNotes);
            console.log('Notas parseadas:', parsedNotes);
            console.log('Número de notas:', parsedNotes.length);
        } catch (e) {
            console.error('Erro ao parsear notas do localStorage:', e);
        }
    }
    
    const board = document.getElementById('board');
    console.log('Board element:', board);
    console.log('Board HTML:', board.innerHTML);
    console.log('Board children:', board.children.length);
    
    console.log('=== END DEBUG ===');
    
    return 'Debug concluído. Verifique o console para mais informações.';
}

// Expor função para uso externo
window.debugReminderBoard = debugReminderBoard;