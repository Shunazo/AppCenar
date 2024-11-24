// WebSocket connection for real-time updates
const socket = io('/business');
let activeOrdersTable = document.getElementById('activeOrdersTable');

socket.on('connect', () => {
    socket.emit('join-business', businessId);
});

socket.on('new-order', (order) => {
    playNotificationSound();
    showNewOrderNotification(order);
    addOrderToTable(order);
});

socket.on('order-status-update', (data) => {
    updateOrderRow(data.orderId, data.status);
});

// Order Management Functions
async function viewOrderDetails(orderId) {
    try {
        const response = await fetch(`/business/orders/${orderId}/details`);
        const data = await response.json();
        
        const modalContent = document.getElementById('orderDetailsContent');
        modalContent.innerHTML = generateOrderDetailsHTML(data);
        
        $('#orderDetailsModal').modal('show');
    } catch (error) {
        showAlert('Error al cargar detalles del pedido', 'error');
    }
}

async function acceptOrder(orderId) {
    if (confirm('¿Desea aceptar este pedido?')) {
        try {
            const response = await fetch(`/business/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'accepted' })
            });
            
            if (response.ok) {
                updateOrderRow(orderId, 'accepted');
                showAlert('Pedido aceptado exitosamente', 'success');
            }
        } catch (error) {
            showAlert('Error al aceptar pedido', 'error');
        }
    }
}

async function rejectOrder(orderId) {
    const reason = prompt('Motivo del rechazo:');
    if (reason) {
        try {
            const response = await fetch(`/business/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    status: 'cancelled',
                    rejection_reason: reason 
                })
            });
            
            if (response.ok) {
                removeOrderRow(orderId);
                showAlert('Pedido rechazado', 'warning');
            }
        } catch (error) {
            showAlert('Error al rechazar pedido', 'error');
        }
    }
}

async function markAsReady(orderId) {
    try {
        const response = await fetch(`/business/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'ready' })
        });
        
        if (response.ok) {
            removeOrderRow(orderId);
            showAlert('Pedido marcado como listo', 'success');
        }
    } catch (error) {
        showAlert('Error al actualizar estado del pedido', 'error');
    }
}

// Helper Functions
function generateOrderDetailsHTML(data) {
    const { order, items } = data;
    return `
        <div class="order-details">
            <div class="customer-info mb-3">
                <h6>Cliente</h6>
                <p>Nombre: ${order.client_name}</p>
                <p>Teléfono: ${order.client_phone}</p>
                <p>Dirección: ${order.delivery_address}</p>
            </div>
            <div class="items-list">
                <h6>Productos</h6>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Cantidad</th>
                            <th>Precio</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map(item => `
                            <tr>
                                <td>${item.product_name}</td>
                                <td>${item.quantity}</td>
                                <td>$${item.price}</td>
                                <td>$${(item.quantity * item.price).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3" class="text-end"><strong>Total:</strong></td>
                            <td>$${order.total}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    `;
}

function updateOrderRow(orderId, status) {
    const row = document.querySelector(`tr[data-order-id="${orderId}"]`);
    if (row) {
        const statusCell = row.querySelector('.order-status');
        statusCell.className = `badge bg-${getStatusColor(status)}`;
        statusCell.textContent = getStatusText(status);
        
        updateActionButtons(row, status);
    }
}

function removeOrderRow(orderId) {
    const row = document.querySelector(`tr[data-order-id="${orderId}"]`);
    if (row) {
        row.remove();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Enable push notifications
    requestNotificationPermission();
    
    // Initialize real-time order updates
    initializeOrderUpdates();
});
