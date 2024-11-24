class ZonePerformance {
    constructor() {
        this.metrics = new Map();
        this.dateRange = {
            start: null,
            end: null
        };
    }

    async calculateMetrics(zoneId, startDate, endDate) {
        this.dateRange = { start: startDate, end: endDate };
        
        const deliveryData = await this.fetchDeliveryData(zoneId);
        const metrics = {
            totalDeliveries: deliveryData.length,
            averageTime: this.calculateAverageDeliveryTime(deliveryData),
            onTimeRate: this.calculateOnTimeDeliveryRate(deliveryData),
            customerSatisfaction: this.calculateCustomerSatisfaction(deliveryData),
            revenue: this.calculateTotalRevenue(deliveryData),
            peakTimes: this.identifyPeakTimes(deliveryData),
            driverPerformance: this.analyzeDriverPerformance(deliveryData)
        };

        this.metrics.set(zoneId, metrics);
        return metrics;
    }

    calculateAverageDeliveryTime(deliveries) {
        const times = deliveries.map(d => d.deliveryTime);
        return times.reduce((a, b) => a + b, 0) / times.length;
    }

    calculateOnTimeDeliveryRate(deliveries) {
        const onTimeDeliveries = deliveries.filter(d => !d.isLate).length;
        return (onTimeDeliveries / deliveries.length) * 100;
    }

    calculateCustomerSatisfaction(deliveries) {
        const ratings = deliveries.map(d => d.rating);
        return ratings.reduce((a, b) => a + b, 0) / ratings.length;
    }

    calculateTotalRevenue(deliveries) {
        return deliveries.reduce((total, delivery) => {
            return total + delivery.deliveryFee + delivery.orderTotal;
        }, 0);
    }

    identifyPeakTimes(deliveries) {
        const hourlyCount = new Array(24).fill(0);
        deliveries.forEach(delivery => {
            const hour = new Date(delivery.timestamp).getHours();
            hourlyCount[hour]++;
        });
        
        return hourlyCount.map((count, hour) => ({
            hour,
            count,
            percentage: (count / deliveries.length) * 100
        }));
    }

    analyzeDriverPerformance(deliveries) {
        const driverStats = new Map();
        
        deliveries.forEach(delivery => {
            if (!driverStats.has(delivery.driverId)) {
                driverStats.set(delivery.driverId, {
                    totalDeliveries: 0,
                    averageTime: 0,
                    rating: 0,
                    onTimeRate: 0
                });
            }
            
            const stats = driverStats.get(delivery.driverId);
            stats.totalDeliveries++;
            stats.averageTime += delivery.deliveryTime;
            stats.rating += delivery.rating;
            if (!delivery.isLate) stats.onTimeRate++;
        });

        driverStats.forEach((stats, driverId) => {
            stats.averageTime /= stats.totalDeliveries;
            stats.rating /= stats.totalDeliveries;
            stats.onTimeRate = (stats.onTimeRate / stats.totalDeliveries) * 100;
        });

        return Array.from(driverStats.entries());
    }

    async fetchDeliveryData(zoneId) {
        const response = await fetch(`/api/zones/${zoneId}/deliveries`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(this.dateRange)
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch delivery data');
        }
        
        return response.json();
    }
}

export default ZonePerformance;
