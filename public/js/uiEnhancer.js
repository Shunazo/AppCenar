class UIEnhancer {
    constructor() {
        this.initializeTooltips();
        this.initializeModals();
        this.initializeDropdowns();
        this.addLoadingIndicators();
    }

    initializeTooltips() {
        const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltips.forEach(tooltip => {
            new bootstrap.Tooltip(tooltip);
        });
    }

    initializeModals() {
        document.querySelectorAll('[data-modal]').forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const modalId = trigger.dataset.modal;
                const modal = new bootstrap.Modal(document.getElementById(modalId));
                modal.show();
            });
        });
    }

    addLoadingIndicators() {
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', () => {
                const submitButton = form.querySelector('button[type="submit"]');
                if (submitButton) {
                    submitButton.disabled = true;
                    submitButton.innerHTML = `
                        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        Procesando...
                    `;
                }
            });
        });
    }
}
