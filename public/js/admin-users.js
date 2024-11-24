let currentUserId = null;

document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userData = Object.fromEntries(formData.entries());
    
    try {
        const url = currentUserId ? 
            `/admin/users/${currentUserId}` : 
            '/admin/users';
            
        const response = await fetch(url, {
            method: currentUserId ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            $('#userModal').modal('hide');
            location.reload();
        } else {
            throw new Error('Error en la operación');
        }
    } catch (error) {
        showAlert('Error al guardar usuario', 'error');
    }
});

async function editUser(userId) {
    try {
        const response = await fetch(`/admin/users/${userId}`);
        const user = await response.json();
        
        currentUserId = user.id;
        const form = document.getElementById('userForm');
        
        form.elements.name.value = user.name;
        form.elements.lastname.value = user.lastname;
        form.elements.email.value = user.email;
        form.elements.phone.value = user.phone;
        form.elements.role.value = user.role;
        form.elements.password.value = '';
        
        $('#userModal').modal('show');
    } catch (error) {
        showAlert('Error al cargar usuario', 'error');
    }
}

async function toggleUserStatus(userId) {
    if (confirm('¿Está seguro de cambiar el estado de este usuario?')) {
        try {
            const response = await fetch(`/admin/users/${userId}/toggle-status`, {
                method: 'PUT'
            });
            
            if (response.ok) {
                location.reload();
            } else {
                throw new Error('Error al cambiar estado');
            }
        } catch (error) {
            showAlert('Error al cambiar estado del usuario', 'error');
        }
    }
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.querySelector('.container-fluid').insertAdjacentElement('afterbegin', alertDiv);
    
    setTimeout(() => alertDiv.remove(), 3000);
}
