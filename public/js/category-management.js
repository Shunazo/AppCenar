const categoryManagement = {
    init() {
        this.bindFormEvents();
        this.initContextMenu();
    },

    bindFormEvents() {
        // Add Category Form Handler
        $('#addCategoryForm').on('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(this);
            
            try {
                const response = await fetch('/business/menu/categories', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(Object.fromEntries(formData))
                });
                
                const data = await response.json();
                if (data.success) {
                    location.reload();
                }
            } catch (error) {
                showToast('error', 'Error al crear categoría');
            }
        });

        // Edit Category Form Handler
        $('#editCategoryForm').on('submit', async function(e) {
            e.preventDefault();
            const categoryId = $(this).data('categoryId');
            const formData = new FormData(this);
            
            try {
                const response = await fetch(`/business/menu/categories/${categoryId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(Object.fromEntries(formData))
                });
                
                const data = await response.json();
                if (data.success) {
                    location.reload();
                }
            } catch (error) {
                showToast('error', 'Error al actualizar categoría');
            }
        });
    },

    initContextMenu() {
        $.contextMenu({
            selector: '#categoriesList .list-group-item',
            callback: function(key, options) {
                const categoryId = $(this).data('categoryId');
                switch(key) {
                    case "edit":
                        categoryManagement.editCategory(categoryId);
                        break;
                    case "delete":
                        categoryManagement.deleteCategory(categoryId);
                        break;
                }
            },
            items: {
                "edit": {name: "Editar", icon: "edit"},
                "delete": {name: "Eliminar", icon: "delete"}
            }
        });
    },

    async editCategory(categoryId) {
        try {
            const response = await fetch(`/business/menu/categories/${categoryId}`);
            const category = await response.json();
            
            const form = $('#editCategoryForm');
            form.find('[name="name"]').val(category.name);
            form.data('categoryId', categoryId);
            
            $('#editCategoryModal').modal('show');
        } catch (error) {
            showToast('error', 'Error al cargar categoría');
        }
    },

    async deleteCategory(categoryId) {
        if (confirm('¿Está seguro de eliminar esta categoría?')) {
            try {
                const response = await fetch(`/business/menu/categories/${categoryId}`, {
                    method: 'DELETE'
                });
                
                const data = await response.json();
                if (data.success) {
                    location.reload();
                }
            } catch (error) {
                showToast('error', 'Error al eliminar categoría');
            }
        }
    }
};

// Initialize on document ready
$(document).ready(() => categoryManagement.init());
