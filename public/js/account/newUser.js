async function createUser(isDraft = false) {
    try {
        // Remove o campo de senha do formulário
        const { password, ...formDataWithoutPassword } = formData.basicInfo;
        
        const userData = {
            ...formDataWithoutPassword,
            isDraft: isDraft,
            userStatus: isDraft ? 'Pendente' : formData.basicInfo.userStatus,
            onboardingCompleted: false,
            isFirstAccess: true // Indica que é primeiro acesso
        };

        // Enviar dados para a API
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao criar usuário');
        }

        const result = await response.json();

        // Exibir notificação de sucesso com informações adicionais
        const message = isDraft 
            ? 'Rascunho salvo com sucesso!' 
            : 'Usuário criado com sucesso! Um email será enviado para definição da senha.';

        showNotification(message, 'success');

        // Redirecionar para a lista de usuários após 1 segundo
        setTimeout(() => {
            window.location.href = 'user-management.html?userCreated=true';
        }, 1000);

    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        showNotification(error.message || 'Erro ao criar usuário', 'error');
    }
} 