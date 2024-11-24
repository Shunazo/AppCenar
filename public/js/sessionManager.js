class SessionManager {
    constructor() {
        this.heartbeatInterval = 5 * 60 * 1000; // 5 minutes
        this.initHeartbeat();
        this.initTabSync();
    }

    initHeartbeat() {
        setInterval(() => {
            fetch('/api/session/heartbeat', {
                method: 'POST',
                credentials: 'same-origin'
            });
        }, this.heartbeatInterval);
    }

    initTabSync() {
        window.addEventListener('storage', (event) => {
            if (event.key === 'userLogout') {
                window.location.href = '/login';
            }
        });
    }

    static logout() {
        localStorage.setItem('userLogout', Date.now().toString());
        window.location.href = '/logout';
    }
}
