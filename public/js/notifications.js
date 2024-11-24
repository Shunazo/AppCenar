const notifications = {
    init() {
        this.toastContainer = $('<div>').addClass('toast-container position-fixed top-0 end-0 p-3')
            .appendTo('body');
    },

    showToast(type, message) {
        const toast = $(`
            <div class="toast" role="alert">
                <div class="toast-header bg-${type} text-white">
                    <i class="fas fa-${this.getIcon(type)} me-2"></i>
                    <strong class="me-auto">${this.getTitle(type)}</strong>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
                </div>
                <div class="toast-body">
                    ${message}
                </div>
            </div>
        `);

        this.toastContainer.append(toast);
        const bsToast = new bootstrap.Toast(toast[0], {
            autohide: true,
            delay: 3000
        });
        bsToast.show();

        toast.on('hidden.bs.toast', function() {
            $(this).remove();
        });
    },

    getIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'times-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    },

    getTitle(type) {
        const titles = {
            success: 'Éxito',
            error: 'Error',
            warning: 'Advertencia',
            info: 'Información'
        };
        return titles[type] || 'Información';
    }
};

// Initialize on document ready
$(document).ready(() => notifications.init());
