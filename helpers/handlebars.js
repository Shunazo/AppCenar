module.exports = {
    toJSON: function(obj) {
        return JSON.stringify(obj);
    },
    
    eq: function(a, b) {
        return a === b;
    },
    
    formatPrice: function(price) {
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP'
        }).format(price);
    },
    
    formatDate: function(date) {
        return new Date(date).toLocaleDateString('es-DO');
    },
    
    formatTime: function(date) {
        return new Date(date).toLocaleTimeString('es-DO');
    }
};
