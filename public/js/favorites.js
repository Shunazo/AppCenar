document.addEventListener('DOMContentLoaded', () => {
    initializeFavoriteButtons();
});

function initializeFavoriteButtons() {
    const favoriteButtons = document.querySelectorAll('.remove-favorite');
    
    favoriteButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            const businessId = e.currentTarget.dataset.businessId;
            
            try {
                const response = await fetch(`/favorites/${businessId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Remove card with animation
                    const card = e.currentTarget.closest('.col-md-6');
                    card.style.transition = 'opacity 0.3s ease';
                    card.style.opacity = '0';
                    
                    setTimeout(() => {
                        card.remove();
                        
                        // Check if there are no more favorites
                        const remainingCards = document.querySelectorAll('.col-md-6').length;
                        if (remainingCards === 0) {
                            showEmptyState();
                        }
                    }, 300);
                }
            } catch (error) {
                showAlert('Error al actualizar favoritos', 'error');
            }
        });
    });
}

function showEmptyState() {
    const container = document.querySelector('.row');
    container.innerHTML = `
        <div class="col-12 text-center mt-5">
            <div class="empty-state">
                <i class="fas fa-heart fa-3x text-muted mb-3"></i>
                <h4>No tienes favoritos aún</h4>
                <p class="text-muted">Explora nuestros comercios y agrega tus favoritos</p>
                <a href="/comercios" class="btn btn-primary mt-3">
                    Explorar Comercios
                </a>
            </div>
        </div>
    `;
}
