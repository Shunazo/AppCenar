const authForms = {
    init() {
        this.bindLoginForm();
        this.bindRegisterForms();
        this.initPasswordValidation();
    },

    bindLoginForm() {
        $('#loginForm').on('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            
            try {
                const response = await fetch('/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(Object.fromEntries(formData))
                });
                
                const data = await response.json();
                if (data.success) {
                    window.location.href = data.redirect;
                } else {
                    showToast('error', data.error);
                }
            } catch (error) {
                showToast('error', 'Error al iniciar sesión');
            }
        });
    },

    bindRegisterForms() {
        // User Registration
        $('#userRegisterForm').on('submit', async function(e) {
            e.preventDefault();
            if (!authForms.validatePasswords(this)) return;
            
            const formData = new FormData(this);
            try {
                const response = await fetch('/auth/register/user', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                if (data.success) {
                    $('#userRegisterModal').modal('hide');
                    showToast('success', data.message);
                } else {
                    showToast('error', data.error);
                }
            } catch (error) {
                showToast('error', 'Error en el registro');
            }
        });

        // Business Registration
        $('#businessRegisterForm').on('submit', async function(e) {
            e.preventDefault();
            if (!authForms.validatePasswords(this)) return;
            
            const formData = new FormData(this);
            try {
                const response = await fetch('/auth/register/business', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                if (data.success) {
                    $('#businessRegisterModal').modal('hide');
                    showToast('success', data.message);
                } else {
                    showToast('error', data.error);
                }
            } catch (error) {
                showToast('error', 'Error en el registro');
            }
        });
    },

    initPasswordValidation() {
        $('input[name="password"]').on('input', function() {
            const password = $(this).val();
            const validations = {
                length: password.length >= 6,
                number: /\d/.test(password)
            };
            
            // Update validation indicators
            Object.entries(validations).forEach(([key, valid]) => {
                $(`#${key}Validation`).toggleClass('text-success', valid)
                                    .toggleClass('text-danger', !valid);
            });
        });
    },

    validatePasswords(form) {
        const password = form.querySelector('input[name="password"]').value;
        const confirm = form.querySelector('input[name="confirmPassword"]').value;
        
        if (password !== confirm) {
            showToast('error', 'Las contraseñas no coinciden');
            return false;
        }
        
        if (password.length < 6 || !/\d/.test(password)) {
            showToast('error', 'La contraseña no cumple con los requisitos');
            return false;
        }
        
        return true;
    }
};

document.addEventListener('DOMContentLoaded', function() {
    // Form validation
    const forms = document.querySelectorAll('.needs-validation');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        });
    });

    // Password matching validation
    const passwordForm = document.querySelector('form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(event) {
            const password = document.querySelector('input[name="password"]');
            const confirmPassword = document.querySelector('input[name="confirmPassword"]');

            if (password && confirmPassword && password.value !== confirmPassword.value) {
                event.preventDefault();
                alert('Las contraseñas no coinciden');
            }
        });
    }
});
