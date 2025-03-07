document.addEventListener('DOMContentLoaded', function() {
    // Inicializar componentes
    initNotifications();
    
    // Verificar se há convites pendentes
    checkPendingInvitations();
});

/**
 * Inicializa as notificações no dashboard
 */
function initNotifications() {
    // Exemplo de notificação para convites pendentes
    const notificationArea = document.getElementById('notificationArea');
    
    // Aqui você pode adicionar lógica para buscar notificações do servidor
    // Por enquanto, usamos dados estáticos
}

/**
 * Verifica se há convites pendentes e exibe notificação
 */
function checkPendingInvitations() {
    // Simulação de API - em produção, isso seria uma chamada real à API
    const pendingInvitations = 2; // Exemplo: 2 convites pendentes
    
    if (pendingInvitations > 0) {
        // Adicionar badge de notificação ao ícone de convites no sidebar
        const invitationsLink = document.querySelector('a[href="/pages/account/invitations.html"]');
        if (invitationsLink) {
            const badge = document.createElement('span');
            badge.className = 'absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center';
            badge.textContent = pendingInvitations;
            
            // Adicionar badge apenas se o elemento tiver posição relativa
            const iconContainer = invitationsLink.querySelector('i').parentElement;
            if (iconContainer) {
                iconContainer.style.position = 'relative';
                iconContainer.appendChild(badge);
            }
        }
    }
} 