document.addEventListener('DOMContentLoaded', async function() {
    // Elementos do formulário
    const preferredNameInput = document.getElementById('preferredName');
    const continueBtn = document.getElementById('continueBtn');
    const profilePhotoInput = document.getElementById('profilePhoto');
    const photoPreview = document.querySelector('.photo-content');
    const logoffBtn = document.getElementById('logoffBtn');
    
    // Função para mostrar mensagens de erro
    function showError(message) {
        alert(message);
    }  
    // Função para validar o nome
    function validateName(name) {
        // Verifica se o nome está vazio
        if (!name || name.trim().length === 0) {
            return false;
        }

        // Verifica se o nome tem pelo menos 2 caracteres
        if (name.trim().length < 2) {
            return false;
        }

        // Verifica se o nome contém apenas caracteres permitidos
        // Aceita letras, acentos, espaços, hífens, apóstrofos e pontos
        const namePattern = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'.-]+$/;
        return namePattern.test(name.trim());
    }
    
    // Função para inicializar a sessão
    async function initializeSession() {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('Token não encontrado no localStorage');
            throw new Error('Token não encontrado');
        }

        try {
            console.log('Inicializando sessão com token:', token.substring(0, 10) + '...');
            const initResponse = await fetch('/api/auth/init-session', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include'
            });

            const data = await initResponse.json();
            console.log('Resposta da inicialização da sessão:', data);

            if (!initResponse.ok || data.status !== 'success') {
                console.error('Erro na inicialização da sessão:', data);
                throw new Error(data.message || 'Falha ao inicializar sessão');
            }

            return data;
        } catch (error) {
            console.error('Erro ao inicializar sessão:', error);
            throw error;
        }
    }
    
    // Função unificada para gerenciar dados do usuário
    async function handleUserData() {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Token não encontrado');

            // Buscar dados do usuário diretamente da API
            const response = await fetch('/api/users/me', {
                method: 'GET',
                headers: { 
                    'Authorization': `Bearer ${token}` 
                },
                credentials: 'include'
            });

            const data = await response.json();
            console.log('Dados do usuário recebidos:', data); // Debug

            if (!response.ok || data.status !== 'success') {
                throw new Error(data.message || 'Erro ao buscar dados do usuário');
            }

            const userData = data.user;

            // Atualizar UI
            if (preferredNameInput) {
                preferredNameInput.value = userData.preferredName || '';
            }

            console.log('Foto do usuário:', userData.photo); // Debug
            updatePhotoPreview(userData.photo);

            // 5. Verificar estado do onboarding e redirecionar
            if (userData.onboardingCompleted) {
                // Verificar empresa
                const companyData = await fetch('/api/companies/user', {
                    headers: { 'Authorization': `Bearer ${token}` },
                    credentials: 'include'
                }).then(res => res.json());

                if (companyData.status === 'success' && companyData.companies?.length > 0) {
                    const company = companyData.companies[0];
                    window.location.href = company.hasPlan ? 
                        '/pages/dashboard/dashboard.html' : 
                        '/pages/company/plans.html';
                    return;
                }

                // Verificar convites
                const inviteData = await fetch('/api/invitations/pending', {
                    headers: { 'Authorization': `Bearer ${token}` },
                    credentials: 'include'
                }).then(res => res.json());

                window.location.href = inviteData.status === 'success' && inviteData.invitations?.length > 0 ?
                    '/pages/company/invitations.html' :
                    '/pages/company/setup.html';
            }

        } catch (error) {
            console.error('Erro ao gerenciar dados do usuário:', error);
            showError('Erro ao carregar dados. Por favor, faça login novamente.');
            setTimeout(() => {
                localStorage.removeItem('token');
                window.location.href = '/login.html';
            }, 2000);
        }
    }
    
    // Função para manipulação da UI da foto
    function updatePhotoPreview(imageUrl) {
        if (!imageUrl || imageUrl === '') {
            photoPreview.innerHTML = '<i class="fas fa-user text-3xl text-gray-400"></i>';
            return;
        }
        
        // Ajustar o caminho da imagem
        let finalImageUrl = imageUrl;
        if (imageUrl.startsWith('uploads/')) {
            finalImageUrl = `/api/users/profile-photo/${imageUrl.split('/').pop()}`; // Pega apenas o nome do arquivo
        }
        
        console.log('URL final da imagem:', finalImageUrl);
        
        const img = new Image();
        img.onload = () => photoPreview.innerHTML = `<img src="${finalImageUrl}" alt="Foto de perfil" class="w-full h-full object-cover">`;
        img.onerror = () => {
            console.error('Erro ao carregar imagem:', finalImageUrl);
            photoPreview.innerHTML = '<i class="fas fa-user text-3xl text-gray-400"></i>';
        };
        img.src = finalImageUrl;
    }
    
    // Inicializar a página
    await handleUserData();
    
    // Preview da foto
    if (profilePhotoInput) {
        profilePhotoInput.addEventListener('change', function(e) {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                
                // Verificar o tamanho do arquivo (máximo 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    showError('A foto deve ter no máximo 5MB');
                    e.target.value = '';
                    return;
                }
                
                // Verificar o tipo do arquivo
                if (!file.type.startsWith('image/')) {
                    showError('Por favor, selecione apenas arquivos de imagem');
                    e.target.value = '';
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    updatePhotoPreview(e.target.result);
                }
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Função para salvar o perfil do usuário
    async function saveUserProfile() {
        try {
            const preferredName = preferredNameInput.value.trim();
            const profilePhoto = profilePhotoInput.files[0];

            if (!validateName(preferredName)) {
                showError('Por favor, insira um nome válido usando apenas letras, acentos, espaços, hífens e apóstrofos.');
                return;
            }

            const formData = new FormData();
            formData.append('preferredName', preferredName);
            if (profilePhoto) {
                formData.append('profilePhoto', profilePhoto);
            }

            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Token não encontrado');
            }

            console.log('Enviando dados do perfil:', {
                preferredName,
                hasPhoto: !!profilePhoto
            });

            const response = await fetch('/api/users/profile', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include',
                body: formData
            });

            const data = await response.json();
            console.log('Resposta do servidor:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao salvar informações');
            }

            // Continuar para a próxima etapa
            window.location.href = '/pages/company/setup.html';
        } catch (error) {
            console.error('Erro ao salvar:', error);
            if (error.message.includes('401')) {
                // Se for erro de autenticação, tentar reinicializar a sessão
                try {
                    await initializeSession();
                    return saveUserProfile(); // Tentar novamente após reinicializar sessão
                } catch (sessionError) {
                    showError('Sessão expirada. Por favor, faça login novamente.');
                    setTimeout(() => {
                        localStorage.removeItem('token');
                        window.location.href = '/login.html';
                    }, 2000);
                    return;
                }
            }
            showError('Erro ao salvar suas informações. Por favor, tente novamente.');
        }
    }

    // Evento para o botão continuar
    if (continueBtn) {
        continueBtn.addEventListener('click', saveUserProfile);
    }

    // Função para fazer logoff
    async function handleLogoff() {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });

            // Mesmo se der erro, vamos limpar o token e redirecionar
            localStorage.removeItem('token');
            window.location.href = '/login.html';
        } catch (error) {
            console.error('Erro ao fazer logoff:', error);
            // Mesmo com erro, redirecionar para login
            localStorage.removeItem('token');
            window.location.href = '/login.html';
        }
    }

    // Adicionar evento de click no botão de logoff
    if (logoffBtn) {
        logoffBtn.addEventListener('click', handleLogoff);
    }
}); 