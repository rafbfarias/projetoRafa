document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('faturacao-form');
  const lancamentosList = document.getElementById('lancamentos-list');
  const saveBtn = document.getElementById('save-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const lancamentoIdInput = document.getElementById('lancamento-id');
  
  // Carregar lançamentos ao iniciar
  fetchLancamentos();
  
  // Adicionar evento de submit ao formulário
  form.addEventListener('submit', handleFormSubmit);
  
  // Adicionar evento ao botão cancelar
  cancelBtn.addEventListener('click', resetForm);
  
  // Função para buscar todos os lançamentos
  function fetchLancamentos() {
    fetch('/api/faturacao')
      .then(response => response.json())
      .then(data => renderLancamentos(data))
      .catch(error => console.error('Erro ao buscar lançamentos:', error));
  }
  
  // Função para renderizar os lançamentos na tabela
  function renderLancamentos(lancamentos) {
    lancamentosList.innerHTML = '';
    
    if (lancamentos.length === 0) {
      lancamentosList.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nenhum lançamento encontrado</td></tr>';
      return;
    }
    
    lancamentos.forEach(lancamento => {
      const row = document.createElement('tr');
      
      const data = new Date(lancamento.dataEmissao).toLocaleDateString('pt-BR');
      const valor = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lancamento.valor);
      
      let statusClass = '';
      if (lancamento.status === 'Pendente') statusClass = 'status-pendente';
      else if (lancamento.status === 'Pago') statusClass = 'status-pago';
      else if (lancamento.status === 'Cancelado') statusClass = 'status-cancelado';
      
      row.innerHTML = `
        <td>${lancamento.cliente}</td>
        <td>${lancamento.descricao}</td>
        <td>${valor}</td>
        <td>${data}</td>
        <td class="${statusClass}">${lancamento.status}</td>
        <td>
          <button class="action-btn edit-btn" data-id="${lancamento._id}">Editar</button>
          <button class="action-btn delete-btn" data-id="${lancamento._id}">Excluir</button>
        </td>
      `;
      
      lancamentosList.appendChild(row);
    });
    
    // Adicionar eventos aos botões de editar e excluir
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => editLancamento(btn.getAttribute('data-id')));
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteLancamento(btn.getAttribute('data-id')));
    });
  }
  
  // Função para lidar com o envio do formulário
  function handleFormSubmit(e) {
    e.preventDefault();
    
    const lancamentoId = lancamentoIdInput.value;
    const lancamento = {
      cliente: document.getElementById('cliente').value,
      descricao: document.getElementById('descricao').value,
      valor: parseFloat(document.getElementById('valor').value),
      status: document.getElementById('status').value
    };
    
    if (lancamentoId) {
      // Atualizar lançamento existente
      updateLancamento(lancamentoId, lancamento);
    } else {
      // Criar novo lançamento
      createLancamento(lancamento);
    }
  }
  
  // Função para criar um novo lançamento
  function createLancamento(lancamento) {
    fetch('/api/faturacao', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(lancamento)
    })
    .then(response => response.json())
    .then(data => {
      resetForm();
      fetchLancamentos();
      alert('Lançamento criado com sucesso!');
    })
    .catch(error => console.error('Erro ao criar lançamento:', error));
  }
  
  // Função para buscar um lançamento para edição
  function editLancamento(id) {
    fetch(`/api/faturacao/${id}`)
      .then(response => response.json())
      .then(lancamento => {
        // Preencher o formulário com os dados do lançamento
        lancamentoIdInput.value = lancamento._id;
        document.getElementById('cliente').value = lancamento.cliente;
        document.getElementById('descricao').value = lancamento.descricao;
        document.getElementById('valor').value = lancamento.valor;
        document.getElementById('status').value = lancamento.status;
        
        // Mostrar botão de cancelar e alterar texto do botão salvar
        saveBtn.textContent = 'Atualizar';
        cancelBtn.style.display = 'block';
        
        // Rolar para o formulário
        form.scrollIntoView({ behavior: 'smooth' });
      })
      .catch(error => console.error('Erro ao buscar lançamento para edição:', error));
  }
  
  // Função para atualizar um lançamento
  function updateLancamento(id, lancamento) {
    fetch(`/api/faturacao/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(lancamento)
    })
    .then(response => response.json())
    .then(data => {
      resetForm();
      fetchLancamentos();
      alert('Lançamento atualizado com sucesso!');
    })
    .catch(error => console.error('Erro ao atualizar lançamento:', error));
  }
  
  // Função para excluir um lançamento
  function deleteLancamento(id) {
    if (confirm('Tem certeza que deseja excluir este lançamento?')) {
      fetch(`/api/faturacao/${id}`, {
        method: 'DELETE'
      })
      .then(response => response.json())
      .then(data => {
        fetchLancamentos();
        alert('Lançamento excluído com sucesso!');
      })
      .catch(error => console.error('Erro ao excluir lançamento:', error));
    }
  }
  
  // Função para resetar o formulário
  function resetForm() {
    form.reset();
    lancamentoIdInput.value = '';
    saveBtn.textContent = 'Salvar';
    cancelBtn.style.display = 'none';
  }
});