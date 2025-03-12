document.addEventListener('DOMContentLoaded', async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const companyId = urlParams.get('companyId');
    const companyNameDisplay = document.getElementById('companyNameDisplay');
    const backBtn = document.getElementById('backBtn');
    const logoffBtn = document.getElementById('logoffBtn');

    // Função para mostrar mensagens de erro
    function showError(message) {
        alert(message);
    }

    // Verificar se temos um companyId
    if (!companyId) {
        showError('Empresa não selecionada');
        window.location.href = '/pages/company/setup.html';
        return;
    }

    // Carregar dados da empresa
    try {
        const response = await fetch(`/api/companies/${companyId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        const data = await response.json();
        if (data.success) {
            companyNameDisplay.textContent = data.company.companyName;
        } else {
            throw new Error(data.message || 'Erro ao carregar dados da empresa');
        }
    } catch (error) {
        console.error('Erro ao carregar empresa:', error);
        showError('Erro ao carregar dados da empresa');
    }

    // Função para selecionar plano
    window.selectPlan = async function(planType) {
        try {
            console.log('Selecionando plano:', { planType, companyId });

            if (planType === 'custom') {
                alert('Entre em contato com nossa equipe comercial para um plano personalizado.');
                return;
            }

            const response = await fetch('/api/companies/plan', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    companyId: companyId,
                    planType: planType.toLowerCase()
                })
            });

            const data = await response.json();
            console.log('Resposta da associação de plano:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao associar plano');
            }

            if (data.success) {
                alert('Plano associado com sucesso!');
                window.location.href = '/pages/dashboard.html';
            } else {
                throw new Error(data.message || 'Erro ao associar plano');
            }
        } catch (error) {
            console.error('Erro ao selecionar plano:', error);
            alert('Erro ao selecionar plano. Por favor, tente novamente.');
        }
    };

    // Botão voltar
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = '/pages/company/setup.html';
        });
    }

    // Botão de logoff
    if (logoffBtn) {
        logoffBtn.addEventListener('click', async () => {
            try {
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    credentials: 'include'
                });
            } catch (error) {
                console.error('Erro ao fazer logout:', error);
            } finally {
                localStorage.removeItem('token');
                window.location.href = '/login.html';
            }
        });
    }
}); 