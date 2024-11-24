// Interactive Features
document.addEventListener('DOMContentLoaded', function() {
    // Lazy loading images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));

    // Add to favorites functionality
    const favButtons = document.querySelectorAll('.fav-button');
    favButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.classList.toggle('active');
            const restaurantId = this.dataset.id;
            // Add your favorite toggle logic here
        });
    });
});
