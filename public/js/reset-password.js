const resetPassword = {
    init() {
        this.bindResetRequestForm();
        this.bindResetPasswordForm();
    },

    bindResetRequestForm() {
        $('#resetPasswordRequestForm').on('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            
            try {
                const response = await fetch('/auth/password/reset-request', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(Object.fromEntries(formData))
                });
                
                const data = await response.json();
                if (data.success) {
                    $('#resetPasswordModal').modal('hide');
                    showToast('success', 'Hemos enviado un correo para restablecer tu contraseña');
                } else {
                    showToast('error', data.error);
                }
            } catch (error) {
                showToast('error', 'Error al procesar la solicitud');
            }
        });
    },

    bindResetPasswordForm() {
        $('#resetPasswordForm').on('submit', async function(e) {
            e.preventDefault();
            if (!authForms.validatePasswords(this)) return;
            
            const formData = new FormData(this);
            try {
                const response = await fetch(`/auth/password/reset/${formData.get('token')}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(Object.fromEntries(formData))
                });
                
                const data = await response.json();
                if (data.success) {
                    showToast('success', 'Contraseña actualizada correctamente');
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 2000);
                } else {
                    showToast('error', data.error);
                }
            } catch (error) {
                showToast('error', 'Error al actualizar la contraseña');
            }
        });
    }
};

// Initialize on document ready
$(document).ready(() => resetPassword.init());
