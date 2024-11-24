class OrderTracking {
    constructor() {
        this.steps = document.querySelectorAll('.tracking-step');
        this.currentStep = 0;
    }

    updateProgress(step) {
        this.steps.forEach((stepElement, index) => {
            if (index <= step) {
                stepElement.classList.add('active');
            } else {
                stepElement.classList.remove('active');
            }
        });
    }

    startTracking() {
        setInterval(() => {
            if (this.currentStep < this.steps.length - 1) {
                this.currentStep++;
                this.updateProgress(this.currentStep);
            }
        }, 5000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const tracking = new OrderTracking();
    tracking.startTracking();
});
