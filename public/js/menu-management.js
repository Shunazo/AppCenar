// Menu Management Functions
const menuManagement = {
    init() {
        this.bindFormEvents();
        this.initSortable();
    },

    bindFormEvents() {
        // Add Product Form Handler
        $('#addProductForm').on('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            
            try {
                const response = await fetch('/business/menu/products', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                if (data.success) {
                    location.reload();
                }
            } catch (error) {
                showToast('error', 'Error al agregar producto');
            }
        });
    },

    async toggleAvailability(productId, isAvailable) {
        try {
            const response = await fetch(`/business/menu/products/${productId}/availability`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isAvailable })
            });
            
            const data = await response.json();
            if (data.success) {
                showToast('success', 'Disponibilidad actualizada');
            }
        } catch (error) {
            showToast('error', 'Error al actualizar disponibilidad');
        }
    },

    async editProduct(productId) {
        try {
            const response = await fetch(`/business/menu/products/${productId}`);
            const product = await response.json();
            
            // Populate edit form
            const form = $('#editProductForm');
            form.find('[name="name"]').val(product.name);
            form.find('[name="description"]').val(product.description);
            form.find('[name="price"]').val(product.price);
            form.find('[name="categoryId"]').val(product.category_id);
            
            // Show edit modal
            $('#editProductModal').modal('show');
            
            // Store product ID for update
            form.data('productId', productId);
        } catch (error) {
            showToast('error', 'Error al cargar producto');
        }
    },

    async deleteProduct(productId) {
        if (confirm('¿Está seguro de eliminar este producto?')) {
            try {
                const response = await fetch(`/business/menu/products/${productId}`, {
                    method: 'DELETE'
                });
                
                const data = await response.json();
                if (data.success) {
                    $(`#product-${productId}`).remove();
                    showToast('success', 'Producto eliminado');
                }
            } catch (error) {
                showToast('error', 'Error al eliminar producto');
            }
        }
    },

    initSortable() {
        // Initialize drag and drop for categories
        new Sortable(document.getElementById('categoriesList'), {
            animation: 150,
            onEnd: async function(evt) {
                const categories = Array.from(evt.to.children).map((item, index) => ({
                    id: item.dataset.categoryId,
                    order: index
                }));
                
                try {
                    await fetch('/business/menu/categories/order', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ categories })
                    });
                } catch (error) {
                    showToast('error', 'Error al reordenar categorías');
                }
            }
        });
    }
};

// Initialize on document ready
$(document).ready(() => menuManagement.init());

// Toast notification helper
function showToast(type, message) {
    Toastify({
        text: message,
        duration: 3000,
        gravity: 'top',
        position: 'right',
        backgroundColor: type === 'success' ? '#28a745' : '#dc3545'
    }).showToast();
}
