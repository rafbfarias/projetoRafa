document.addEventListener('DOMContentLoaded', function() {
    const teamMembersList = document.getElementById('team-members-list');
    const noMembersMessage = document.getElementById('no-members-message');
    
    function updateMembersList(members) {
        teamMembersList.innerHTML = ''; // Limpa a lista atual
        
        if (members.length === 0) {
            noMembersMessage.classList.remove('hidden');
            teamMembersList.appendChild(noMembersMessage);
            return;
        }
        
        noMembersMessage.classList.add('hidden');
        members.forEach(member => {
            const memberElement = createMemberElement(member);
            teamMembersList.appendChild(memberElement);
        });
    }
    
    function createMemberElement(member) {
        const div = document.createElement('div');
        div.className = 'flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700';
        div.innerHTML = `
            <input type="checkbox" id="member-${member.id}" class="team-member-checkbox mr-3">
            <img class="w-8 h-8 rounded-full" src="${member.avatar}" alt="${member.name}">
            <div class="ml-3">
                <p class="text-sm font-medium text-gray-900 dark:text-white">${member.name}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">${member.role}</p>
            </div>
        `;
        return div;
    }
    
    // Inicializar a lista
    updateMembersList([]);
    
    // Atualizar quando membros forem carregados
    // Exemplo: loadTeamMembers().then(updateMembersList);
}); 