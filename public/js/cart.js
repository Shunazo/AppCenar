let cart = {
    items: [],
    businessId: null
};

function addToCart(productId, name, price) {
    const existingItem = cart.items.find(item => item.productId === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.items.push({
            productId,
            name,
            price,
            quantity: 1
        });
    }
    
    updateCartDisplay();
}

function updateCartDisplay() {
    const cartContainer = document.getElementById('cart-items');
    cartContainer.innerHTML = '';
    
    cart.items.forEach(item => {
        cartContainer.innerHTML += `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <div>
                    <h6 class="mb-0">${item.name}</h6>
                    <small class="text-muted">$${item.price} x ${item.quantity}</small>
                </div>
                <div class="btn-group">
                    <button class="btn btn-sm btn-outline-secondary" onclick="updateQuantity(${item.productId}, -1)">-</button>
                    <button class="btn btn-sm btn-outline-secondary" onclick="updateQuantity(${item.productId}, 1)">+</button>
                </div>
            </div>
        `;
    });
    
    updateTotals();
}
