// Função de login
async function handleLogin(event) {
    event.preventDefault();
    console.log('Iniciando login...');

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        // Mostrar indicador de carregamento
        const loginButton = document.querySelector('button[type="submit"]');
        if (loginButton) {
            loginButton.disabled = true;
            loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
        }

        // Adicione este log antes de fazer a requisição fetch
        console.log('Enviando requisição de login para:', email);

        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        // Adicione este log logo após receber a resposta
        console.log('Resposta completa:', response);
        console.log('Status HTTP:', response.status);

        const data = await response.json();
        // Adicione este log após converter a resposta para JSON
        console.log('Dados da resposta:', data);

        // Restaurar botão de login
        if (loginButton) {
            loginButton.disabled = false;
            loginButton.innerHTML = 'Entrar';
        }

        if (response.ok) {
            console.log('Login bem sucedido');
            
            // Armazenar token e dados do usuário
            localStorage.setItem('token', data.token);
            localStorage.setItem('userData', JSON.stringify(data.user));

            // Verificar associação e redirecionar
            const hasActiveAssociation = 
                data.user && 
                data.user.companyAssociation && 
                data.user.companyAssociation.status === 'active';
            
            if (hasActiveAssociation) {
                window.location.href = '/pages/dashboard.html';
            } else {
                window.location.href = '/pages/welcome/welcome.html';
            }
        } else {
            console.error('Erro de login:', data);
            
            // Verificar especificamente o caso de usuário não encontrado
            if (response.status === 404 || data.message === 'Usuário não encontrado') {
                // Usuário não existe - mostrar mensagem específica
                const errorElement = document.getElementById('loginError');
                const errorMessage = `
                    <p class="font-semibold">Ops! Usuário não existe.</p>
                    <p class="text-sm">Ou existe um misspelling ou é um usuário novo. Vamos reencaminhar para a criação de usuário.</p>
                    <div class="mt-2">
                        <button id="createAccountBtn" class="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded text-sm">
                            Criar uma nova conta
                        </button>
                    </div>
                `;
                
                if (errorElement) {
                    errorElement.innerHTML = errorMessage;
                    errorElement.classList.remove('hidden');
                    
                    // Adicionar evento ao botão de criar conta
                    document.getElementById('createAccountBtn').addEventListener('click', () => {
                        // Armazenar o email para preencher automaticamente no formulário de registro
                        localStorage.setItem('registerEmail', email);
                        window.location.href = '/register.html';
                    });
                } else {
                    alert('Ops! Usuário não existe. Vamos reencaminhar para a criação de usuário.');
                    localStorage.setItem('registerEmail', email);
                    window.location.href = '/register.html';
                }
            } else if (data.message === 'Senha incorreta') {
                // Senha incorreta
                const errorElement = document.getElementById('loginError');
                if (errorElement) {
                    errorElement.innerHTML = '<p>Senha incorreta. Por favor, verifique e tente novamente.</p>';
                    errorElement.classList.remove('hidden');
                } else {
                    alert('Senha incorreta. Por favor, verifique e tente novamente.');
                }
            } else {
                // Outros erros
                const errorElement = document.getElementById('loginError');
                if (errorElement) {
                    errorElement.innerHTML = `<p>${data.message || 'Erro ao fazer login. Por favor, tente novamente.'}</p>`;
                    errorElement.classList.remove('hidden');
                } else {
                    alert(data.message || 'Erro ao fazer login. Por favor, tente novamente.');
                }
            }

            // Adicione este console.log para identificar exatamente qual erro está ocorrendo
            console.log('Status da resposta:', response.status);
            console.log('Corpo da resposta:', data);
        }
    } catch (error) {
        // Restaurar botão de login
        const loginButton = document.querySelector('button[type="submit"]');
        if (loginButton) {
            loginButton.disabled = false;
            loginButton.innerHTML = 'Entrar';
        }
        
        console.error('Erro na requisição:', error);
        
        // Modificar esta mensagem para ser mais específica
        const errorElement = document.getElementById('loginError');
        if (errorElement) {
            errorElement.innerHTML = '<p>Erro de conexão com o servidor. Verifique sua internet e tente novamente.</p>';
            errorElement.classList.remove('hidden');
        } else {
            alert('Erro de conexão com o servidor. Verifique sua internet e tente novamente.');
        }
    }
}

// Função para exibir mensagem de erro simples
function showError(message) {
    const errorElement = document.getElementById('loginError');
    if (errorElement) {
        errorElement.innerHTML = `<p>${message}</p>`;
        errorElement.classList.remove('hidden');
    } else {
        alert(message);
    }
}

// Função para exibir erro com ação (botão)
function showErrorWithAction(title, message, buttonText, buttonAction) {
    const errorElement = document.getElementById('loginError');
    if (errorElement) {
        errorElement.innerHTML = `
            <p class="font-semibold mb-1">${title}</p>
            <p class="text-sm mb-2">${message}</p>
            <button id="errorActionBtn" class="text-brand-600 hover:text-brand-800 text-sm font-medium">
                ${buttonText}
            </button>
        `;
        errorElement.classList.remove('hidden');
        
        // Adicionar evento ao botão
        document.getElementById('errorActionBtn').addEventListener('click', buttonAction);
    } else {
        if (confirm(`${title}\n${message}`)) {
            buttonAction();
        }
    }
}

// Garantir que o evento está sendo adicionado
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
        
        // Verificar se há um email armazenado de uma tentativa anterior
        const storedEmail = localStorage.getItem('registerEmail');
        if (storedEmail) {
            const emailInput = document.getElementById('email');
            if (emailInput) {
                emailInput.value = storedEmail;
            }
            // Limpar o email armazenado
            localStorage.removeItem('registerEmail');
        }
    }
}); 