const orderHelpers = {
    getStatusColor(status) {
        const colors = {
            'pending': 'warning',
            'preparing': 'info',
            'ready': 'primary',
            'delivering': 'info',
            'delivered': 'success',
            'cancelled': 'danger'
        };
        return colors[status] || 'secondary';
    },

    getStatusText(status) {
        const texts = {
            'pending': 'Pendiente',
            'preparing': 'En Preparación',
            'ready': 'Listo para Entrega',
            'delivering': 'En Camino',
            'delivered': 'Entregado',
            'cancelled': 'Cancelado'
        };
        return texts[status] || status;
    },

    formatDateTime(date) {
        return new Date(date).toLocaleString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    formatPrice(amount) {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    },

    generateOrderTimeline(events) {
        return events.map(event => `
            <div class="timeline-item">
                <div class="timeline-point bg-${this.getStatusColor(event.status)}"></div>
                <div class="timeline-content">
                    <small class="text-muted">${this.formatDateTime(event.timestamp)}</small>
                    <p class="mb-0">${event.description}</p>
                </div>
            </div>
        `).join('');
    }
};
