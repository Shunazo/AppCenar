document.addEventListener('DOMContentLoaded', function() {
    // Password strength validation
    const passwordInput = document.querySelector('input[name="password"]');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            const strengthMeter = document.getElementById('password-strength');
            
            const hasUpperCase = /[A-Z]/.test(password);
            const hasLowerCase = /[a-z]/.test(password);
            const hasNumbers = /\d/.test(password);
            const hasSpecialChar = /[!@#$%^&*]/.test(password);
            const isLongEnough = password.length >= 8;

            let strength = 0;
            strength += hasUpperCase ? 1 : 0;
            strength += hasLowerCase ? 1 : 0;
            strength += hasNumbers ? 1 : 0;
            strength += hasSpecialChar ? 1 : 0;
            strength += isLongEnough ? 1 : 0;

            updatePasswordStrengthUI(strength);
        });
    }

    // Form validation messages
    const forms = document.querySelectorAll('.needs-validation');
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
                showValidationMessages(form);
            }
            form.classList.add('was-validated');
        });
    });
});

function updatePasswordStrengthUI(strength) {
    const strengthBar = document.querySelector('.password-strength-bar');
    const strengthText = document.querySelector('.password-strength-text');
    
    const strengthLabels = ['Muy Débil', 'Débil', 'Media', 'Fuerte', 'Muy Fuerte'];
    const strengthColors = ['#dc3545', '#ffc107', '#fd7e14', '#20c997', '#198754'];
    
    strengthBar.style.width = `${(strength / 5) * 100}%`;
    strengthBar.style.backgroundColor = strengthColors[strength];
    strengthText.textContent = strengthLabels[strength];
}
