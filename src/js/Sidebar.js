updatePhotoPreview(imageUrl, userName, userRole) {
    const avatarImage = this.querySelector('.avatar-image');
    const userNameElement = this.querySelector('.sidebar-user-info p:first-child');
    const userRoleElement = this.querySelector('.sidebar-user-info p:last-child');
    
    // Atualizar nome e cargo do usuário
    if (userNameElement) userNameElement.textContent = userName;
    if (userRoleElement) userRoleElement.textContent = userRole;
    
    // Usar a função loadUserProfileImage para carregar a imagem com autenticação
    if (!imageUrl || imageUrl === '') {
        avatarImage.src = '/images/users/default-avatar.svg';
    } else if (imageUrl.startsWith('uploads/')) {
        const token = localStorage.getItem('token');
        const filename = imageUrl.split('/').pop();
        
        // Usar fetch com o token para carregar a imagem
        fetch(`/api/users/profile-photo/${filename}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) throw new Error('Erro ao carregar imagem');
            return response.blob();
        })
        .then(blob => {
            // Criar URL do objeto blob
            const objectUrl = URL.createObjectURL(blob);
            avatarImage.src = objectUrl;
        })
        .catch(error => {
            console.error('Erro ao carregar imagem:', error);
            avatarImage.src = '/images/users/default-avatar.svg';
        });
    } else {
        // Para URLs que não começam com 'uploads/' (caso de URLs externas)
        avatarImage.src = imageUrl;
        avatarImage.onerror = () => {
            avatarImage.src = '/images/users/default-avatar.svg';
        };
    }
} 