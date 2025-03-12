// Função de login
async function handleLogin(event) {
    event.preventDefault();
    alert('Função de login chamada'); // Debug com alert para garantir visibilidade
    console.log('Iniciando login...'); // Debug no console

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    console.log('Dados do formulário:', { email }); // Log email (não logar senha)

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        console.log('Resposta do servidor:', data);

        if (response.ok) {
            alert('Login bem sucedido!'); // Debug
            localStorage.setItem('token', data.token);
            localStorage.setItem('userData', JSON.stringify(data.user));

            // Verificar associação
            if (data.user.companyAssociation && data.user.companyAssociation.status === 'active') {
                alert('Redirecionando para dashboard...'); // Debug
                window.location.href = '/pages/dashboard.html';
            } else {
                alert('Redirecionando para welcome...'); // Debug
                window.location.href = '/pages/welcome.html';
            }
        } else {
            alert('Erro: ' + (data.message || 'Erro ao fazer login')); // Debug
        }
    } catch (error) {
        alert('Erro: ' + error.message); // Debug
        console.error('Erro:', error);
    }
}

// Garantir que o script foi carregado
console.log('Script de login carregado');
alert('Script de login carregado'); // Debug

// Garantir que o evento está sendo adicionado
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado'); // Debug
    
    const loginForm = document.getElementById('loginForm');
    console.log('Formulário:', loginForm); // Debug
    
    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            console.log('Formulário submetido'); // Debug
            handleLogin(event);
        });
    }
}); 