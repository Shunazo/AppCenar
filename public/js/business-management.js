// Category Management
const categoryForm = document.getElementById('categoryForm');
const productForm = document.getElementById('productForm');

async function loadCategories() {
    try {
        const response = await fetch('/api/business/categories');
        const categories = await response.json();
        updateCategoriesList(categories);
    } catch (error) {
        showAlert('Error al cargar categorías', 'error');
    }
}

function updateCategoriesList(categories) {
    const categoriesList = document.getElementById('categories-list');
    categoriesList.innerHTML = categories.map(category => `
        <div class="category-item d-flex justify-content-between align-items-center mb-2">
            <span>${category.name}</span>
            <div class="btn-group">
                <button class="btn btn-sm btn-outline-primary" onclick="editCategory(${category.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteCategory(${category.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

categoryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(categoryForm);
    const categoryId = formData.get('categoryId');
    
    try {
        const url = categoryId ? 
            `/api/business/categories/${categoryId}` : 
            '/api/business/categories';
            
        const response = await fetch(url, {
            method: categoryId ? 'PUT' : 'POST',
            body: formData
        });
        
        if (response.ok) {
            $('#categoryModal').modal('hide');
            loadCategories();
            showAlert('Categoría guardada exitosamente', 'success');
        }
    } catch (error) {
        showAlert('Error al guardar categoría', 'error');
    }
});

// Product Management
async function loadProducts() {
    try {
        const response = await fetch('/api/business/products');
        const products = await response.json();
        updateProductsTable(products);
    } catch (error) {
        showAlert('Error al cargar productos', 'error');
    }
}

function updateProductsTable(products) {
    const tbody = document.querySelector('#productsTable tbody');
    tbody.innerHTML = products.map(product => `
        <tr>
            <td><img src="${product.image}" class="product-thumbnail" alt="${product.name}"></td>
            <td>${product.name}</td>
            <td>${product.category_name}</td>
            <td>$${product.price}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="editProduct(${product.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct(${product.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(productForm);
    const productId = formData.get('productId');
    
    try {
        const url = productId ? 
            `/api/business/products/${productId}` : 
            '/api/business/products';
            
        const response = await fetch(url, {
            method: productId ? 'PUT' : 'POST',
            body: formData
        });
        
        if (response.ok) {
            $('#productModal').modal('hide');
            loadProducts();
            showAlert('Producto guardado exitosamente', 'success');
        }
    } catch (error) {
        showAlert('Error al guardar producto', 'error');
    }
});

// Utility Functions
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.querySelector('.container').insertAdjacentElement('afterbegin', alertDiv);
    
    setTimeout(() => alertDiv.remove(), 3000);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadProducts();
});
