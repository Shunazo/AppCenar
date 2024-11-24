const db = require('../config/database');
const ExcelJS = require('exceljs');

const reportController = {
    getSalesReport: async (req, res) => {
        const { startDate, endDate } = req.query;
        
        const query = `
            SELECT 
                o.id,
                o.created_at,
                b.name as business_name,
                u.name as client_name,
                o.total,
                o.status
            FROM orders o
            JOIN businesses b ON o.business_id = b.id
            JOIN users u ON o.user_id = u.id
            WHERE DATE(o.created_at) BETWEEN ? AND ?
            ORDER BY o.created_at DESC
        `;
        
        db.all(query, [startDate, endDate], async (err, orders) => {
            if (err) {
                return res.status(500).json({ error: 'Error generating report' });
            }
            
            // Create Excel workbook
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Sales Report');
            
            // Add headers
            worksheet.addRow([
                'Order ID',
                'Date',
                'Business',
                'Client',
                'Total',
                'Status'
            ]);
            
            // Add data
            orders.forEach(order => {
                worksheet.addRow([
                    order.id,
                    order.created_at,
                    order.business_name,
                    order.client_name,
                    order.total,
                    order.status
                ]);
            });
            
            // Set response headers
            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
            res.setHeader(
                'Content-Disposition',
                `attachment; filename=sales-report-${startDate}-${endDate}.xlsx`
            );
            
            // Send workbook
            await workbook.xlsx.write(res);
            res.end();
        });
    }
};

module.exports = reportController;
