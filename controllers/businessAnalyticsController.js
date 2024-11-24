const db = require('../config/database');

const businessAnalyticsController = {
    getAnalytics: async (req, res) => {
        const businessId = req.session.user.businessId;
        const { startDate, endDate } = req.query;

        try {
            const [
                salesData,
                topProducts,
                metrics,
                comparisons
            ] = await Promise.all([
                getSalesData(businessId, startDate, endDate),
                getTopProducts(businessId, startDate, endDate),
                getMetrics(businessId, startDate, endDate),
                getComparisons(businessId, startDate, endDate)
            ]);

            res.json({
                salesData,
                topProducts,
                metrics,
                comparisons
            });
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener análisis' });
        }
    },

    getDetailedReport: async (req, res) => {
        const businessId = req.session.user.businessId;
        const { startDate, endDate, type } = req.query;

        try {
            let reportData;
            switch(type) {
                case 'sales':
                    reportData = await getDetailedSales(businessId, startDate, endDate);
                    break;
                case 'products':
                    reportData = await getDetailedProducts(businessId, startDate, endDate);
                    break;
                case 'customers':
                    reportData = await getCustomerAnalytics(businessId, startDate, endDate);
                    break;
                default:
                    throw new Error('Tipo de reporte inválido');
            }

            res.json(reportData);
        } catch (error) {
            res.status(500).json({ error: 'Error al generar reporte detallado' });
        }
    }
};

// Helper functions for data retrieval
async function getSalesData(businessId, startDate, endDate) {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as orders,
                SUM(total) as total_sales
            FROM orders
            WHERE business_id = ?
            AND created_at BETWEEN ? AND ?
            AND status = 'delivered'
            GROUP BY DATE(created_at)
            ORDER BY date
        `, [businessId, startDate, endDate], (err, rows) => {
            if (err) reject(err);
            resolve(rows);
        });
    });
}

async function getTopProducts(businessId, startDate, endDate) {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT 
                p.name,
                SUM(oi.quantity) as total_quantity,
                SUM(oi.quantity * oi.price) as total_revenue
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            JOIN orders o ON oi.order_id = o.id
            WHERE o.business_id = ?
            AND o.created_at BETWEEN ? AND ?
            AND o.status = 'delivered'
            GROUP BY p.id
            ORDER BY total_quantity DESC
            LIMIT 10
        `, [businessId, startDate, endDate], (err, rows) => {
            if (err) reject(err);
            resolve(rows);
        });
    });
}

async function getMetrics(businessId, startDate, endDate) {
    return new Promise((resolve, reject) => {
        db.get(`
            SELECT 
                COUNT(*) as total_orders,
                SUM(total) as total_sales,
                AVG(total) as average_ticket,
                (
                    SELECT AVG(rating)
                    FROM business_reviews
                    WHERE business_id = ?
                    AND created_at BETWEEN ? AND ?
                ) as average_rating
            FROM orders
            WHERE business_id = ?
            AND created_at BETWEEN ? AND ?
            AND status = 'delivered'
        `, [businessId, startDate, endDate, businessId, startDate, endDate], 
        (err, metrics) => {
            if (err) reject(err);
            resolve(metrics);
        });
    });
}

async function getComparisons(businessId, startDate, endDate) {
    // Calculate previous period
    const days = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - days);
    
    const [currentMetrics, previousMetrics] = await Promise.all([
        getMetrics(businessId, startDate, endDate),
        getMetrics(businessId, prevStartDate.toISOString(), startDate)
    ]);

    return {
        sales: calculatePercentageChange(previousMetrics.total_sales, currentMetrics.total_sales),
        orders: calculatePercentageChange(previousMetrics.total_orders, currentMetrics.total_orders),
        ticket: calculatePercentageChange(previousMetrics.average_ticket, currentMetrics.average_ticket),
        rating: calculatePercentageChange(previousMetrics.average_rating, currentMetrics.average_rating)
    };
}

function calculatePercentageChange(previous, current) {
    if (!previous) return 100;
    return ((current - previous) / previous * 100).toFixed(1);
}

module.exports = businessAnalyticsController;
