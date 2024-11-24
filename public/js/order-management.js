const orderManagement = {
    socket: null,
    audioAlert: new Audio('/sounds/new-order.mp3'),

    init() {
        this.initWebSocket();
        this.bindFilterEvents();
        this.initRealTimeUpdates();
    },

    initWebSocket() {
        this.socket = io();
        const businessId = document.body.dataset.businessId;
        
        this.socket.on('connect', () => {
            this.socket.emit('joinBusinessRoom', { businessId });
        });

        this.socket.on('newOrder', (order) => {
            this.handleNewOrder(order);
        });
    },

    handleNewOrder(order) {
        // Play notification sound
        this.audioAlert.play();
        
        // Add order to list
        const orderHtml = this.generateOrderHtml(order);
        $('#ordersList').prepend(orderHtml);
        
        // Show notification
        showToast('success', 'Nuevo pedido recibido');
        
        // Update statistics
        this.updateStatistics();
    },

    bindFilterEvents() {
        $('.list-group-item[data-status]').on('click', function(e) {
            e.preventDefault();
            
            // Update active state
            $('.list-group-item').removeClass('active');
            $(this).addClass('active');
            
            // Filter orders
            const status = $(this).data('status');
            if (status === 'all') {
                $('.order-card').show();
            } else {
                $('.order-card').hide();
                $(`.order-card[data-status="${status}"]`).show();
            }
        });
    },

    async updateOrderStatus(orderId, status) {
        try {
            const response = await fetch(`/business/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });
            
            const data = await response.json();
            if (data.success) {
                // Update order card
                const orderCard = $(`.order-card[data-order-id="${orderId}"]`);
                orderCard.attr('data-status', status);
                orderCard.find('.badge').attr('class', `badge bg-${this.getStatusColor(status)}`);
                orderCard.find('.badge').text(this.getStatusText(status));
                
                // Update buttons
                this.updateActionButtons(orderCard, status);
                
                showToast('success', 'Estado actualizado');
            }
        } catch (error) {
            showToast('error', 'Error al actualizar estado');
        }
    },

    showOrderDetails(orderId) {
        fetch(`/business/orders/${orderId}`)
            .then(response => response.json())
            .then(order => {
                $('#orderDetailsModal').modal('show');
                this.populateOrderDetails(order);
            })
            .catch(() => showToast('error', 'Error al cargar detalles'));
    },

    populateOrderDetails(order) {
        const modal = $('#orderDetailsModal');
        modal.find('.order-id').text(order.id);
        modal.find('.order-date').text(this.formatDateTime(order.created_at));
        modal.find('.client-name').text(order.client_name);
        modal.find('.client-phone').text(order.client_phone);
        
        // Populate items
        const itemsList = modal.find('.items-list');
        itemsList.empty();
        order.items.forEach(item => {
            itemsList.append(`
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    ${item.quantity}x ${item.name}
                    <span>${this.formatPrice(item.price * item.quantity)}</span>
                </li>
            `);
        });
        
        modal.find('.order-total').text(this.formatPrice(order.total));
    },

    initRealTimeUpdates() {
        setInterval(() => {
            this.updateStatistics();
        }, 60000); // Update every minute
    },

    async updateStatistics() {
        try {
            const response = await fetch('/business/orders/statistics');
            const stats = await response.json();
            
            $('#todayOrders').text(stats.todayOrders);
            $('#todaySales').text(this.formatPrice(stats.todaySales));
            $('#averageTime').text(`${stats.averageTime} min`);
        } catch (error) {
            console.error('Error updating statistics:', error);
        }
    }
};

// Initialize on document ready
$(document).ready(() => orderManagement.init());
