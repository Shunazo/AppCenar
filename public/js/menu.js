class MenuSystem {
    constructor() {
        this.categoryButtons = document.querySelectorAll('.menu-cat-btn');
        this.menuItems = document.querySelectorAll('.menu-item');
        this.cart = [];
        
        this.initializeEvents();
    }

    initializeEvents() {
        this.categoryButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.filterCategory(button.dataset.category);
            });
        });

        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', () => {
                this.addToCart(button.dataset.id);
            });
        });
    }

    filterCategory(category) {
        this.categoryButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-category="${category}"]`).classList.add('active');

        this.menuItems.forEach(item => {
            if (category === 'all' || item.dataset.category === category) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    addToCart(itemId) {
        // Implementar lógica del carrito
        this.cart.push(itemId);
        this.updateCartUI();
    }

    updateCartUI() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.textContent = this.cart.length;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const menuSystem = new MenuSystem();
});
