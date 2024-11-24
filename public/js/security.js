class SecurityMonitor {
    constructor() {
        this.inactivityTimeout = 1800000; // 30 minutes
        this.warningTime = 300000; // 5 minutes
        this.timer = null;
        this.init();
    }

    init() {
        document.addEventListener('mousemove', () => this.resetTimer());
        document.addEventListener('keypress', () => this.resetTimer());
        this.startTimer();
    }

    resetTimer() {
        clearTimeout(this.timer);
        this.startTimer();
    }

    startTimer() {
        this.timer = setTimeout(() => {
            this.showWarning();
        }, this.inactivityTimeout - this.warningTime);
    }

    showWarning() {
        feedback.showToast('Su sesión expirará en 5 minutos por inactividad', 'warning');
        setTimeout(() => this.logout(), this.warningTime);
    }

    async logout() {
        try {
            await fetch('/logout', { method: 'POST' });
            window.location.href = '/login';
        } catch (error) {
            console.error('Error during logout:', error);
        }
    }
}

const securityMonitor = new SecurityMonitor();
