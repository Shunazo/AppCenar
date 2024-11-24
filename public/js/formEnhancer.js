class FormEnhancer {
    constructor(formSelector) {
        this.form = document.querySelector(formSelector);
        if (this.form) {
            this.init();
        }
    }

    init() {
        this.addPasswordToggle();
        this.addLiveValidation();
        this.handleSubmit();
    }

    addPasswordToggle() {
        const passwordInputs = this.form.querySelectorAll('input[type="password"]');
        passwordInputs.forEach(input => {
            const toggleButton = document.createElement('button');
            toggleButton.type = 'button';
            toggleButton.className = 'password-toggle';
            toggleButton.innerHTML = '<i class="fas fa-eye"></i>';
            input.parentNode.appendChild(toggleButton);

            toggleButton.addEventListener('click', () => {
                const type = input.type === 'password' ? 'text' : 'password';
                input.type = type;
                toggleButton.innerHTML = `<i class="fas fa-eye${type === 'password' ? '' : '-slash'}"></i>`;
            });
        });
    }

    addLiveValidation() {
        this.form.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => {
                this.validateField(input);
            });
        });
    }

    validateField(input) {
        const isValid = input.checkValidity();
        input.classList.toggle('is-valid', isValid);
        input.classList.toggle('is-invalid', !isValid);
    }

    handleSubmit() {
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (this.form.checkValidity()) {
                try {
                    const formData = new FormData(this.form);
                    const response = await fetch(this.form.action, {
                        method: this.form.method,
                        body: formData
                    });
                    const data = await response.json();
                    
                    if (data.success) {
                        feedback.showToast('Operación exitosa', 'success');
                        if (data.redirect) {
                            window.location.href = data.redirect;
                        }
                    } else {
                        feedback.showToast(data.error, 'danger');
                    }
                } catch (error) {
                    feedback.showToast('Error en el servidor', 'danger');
                }
            } else {
                this.form.classList.add('was-validated');
            }
        });
    }
}

// Initialize form enhancement
new FormEnhancer('#loginForm');
new FormEnhancer('#registerForm');
