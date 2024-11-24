document.addEventListener('DOMContentLoaded', () => {
    initializeStarRating();
    initializeReviewForm();
});

function initializeStarRating() {
    const stars = document.querySelectorAll('.stars i');
    
    stars.forEach(star => {
        star.addEventListener('mouseover', function() {
            const rating = this.dataset.rating;
            const type = this.dataset.type;
            updateStars(rating, type, 'hover');
        });

        star.addEventListener('mouseout', function() {
            const type = this.dataset.type;
            const selectedRating = document.querySelector(`input[name="${type}Rating"]`)?.value;
            updateStars(selectedRating || 0, type, 'selected');
        });

        star.addEventListener('click', function() {
            const rating = this.dataset.rating;
            const type = this.dataset.type;
            
            // Create or update hidden input
            let input = document.querySelector(`input[name="${type}Rating"]`);
            if (!input) {
                input = document.createElement('input');
                input.type = 'hidden';
                input.name = `${type}Rating`;
                this.parentNode.appendChild(input);
            }
            input.value = rating;
            
            updateStars(rating, type, 'selected');
        });
    });
}

function updateStars(rating, type, state) {
    const stars = document.querySelectorAll(`.stars i[data-type="${type}"]`);
    
    stars.forEach(star => {
        const starRating = parseInt(star.dataset.rating);
        
        if (state === 'hover') {
            star.className = starRating <= rating ? 'fas fa-star' : 'far fa-star';
        } else {
            star.className = starRating <= rating ? 'fas fa-star selected' : 'far fa-star';
        }
    });
}

function initializeReviewForm() {
    document.getElementById('reviewForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const reviewData = Object.fromEntries(formData.entries());
        
        try {
            const response = await fetch('/reviews/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reviewData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                showAlert('¡Gracias por tu reseña!', 'success');
                setTimeout(() => {
                    window.location.href = '/pedidos';
                }, 2000);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            showAlert(error.message || 'Error al enviar reseña', 'error');
        }
    });
}
