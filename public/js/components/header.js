document.addEventListener('DOMContentLoaded', function() {
    const headerContainer = document.getElementById('header-container');
    
    if (headerContainer) {
        // Criar o header dinamicamente
        const header = document.createElement('header');
        header.className = 'bg-component shadow-sm';
        
        header.innerHTML = `
            <div class="px-4 py-3 flex items-center justify-between">
                <div class="flex items-center">
                    <h1 class="text-xl font-semibold text-gray-800 dark:text-white">
                        ${document.title.split('|')[0] || 'Dashboard'}
                    </h1>
                </div>
                <div class="flex items-center space-x-4">
                    <div class="relative">
                        <button id="notificationsButton" class="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white">
                            <i class="fas fa-bell"></i>
                            <span id="notification-badge" class="hidden absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">0</span>
                        </button>
                    </div>
                    <div class="relative">
                        <button id="messagesButton" class="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white">
                            <i class="fas fa-envelope"></i>
                        </button>
                    </div>
                    <div class="relative">
                        <button id="helpButton" class="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white">
                            <i class="fas fa-question-circle"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        headerContainer.appendChild(header);
        
        // Verificar se há notificações
        checkNotifications();
    }
    
    function checkNotifications() {
        // Aqui você pode implementar a lógica para verificar notificações
        // Por enquanto, vamos apenas simular algumas notificações
        const notificationBadge = document.getElementById('notification-badge');
        if (notificationBadge) {
            const notificationCount = 0; // Altere para simular notificações
            
            if (notificationCount > 0) {
                notificationBadge.textContent = notificationCount > 9 ? '9+' : notificationCount;
                notificationBadge.classList.remove('hidden');
            } else {
                notificationBadge.classList.add('hidden');
            }
        }
    }
}); 