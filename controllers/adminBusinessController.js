const db = require('../config/database');

const adminBusinessController = {
    getBusinessApprovals: async (req, res) => {
        try {
            const [pending, approved, rejected] = await Promise.all([
                getBusinessesByStatus('pending'),
                getBusinessesByStatus('approved'),
                getBusinessesByStatus('rejected')
            ]);

            res.render('admin/business-approval', {
                pendingBusinesses: pending,
                approvedBusinesses: approved,
                rejectedBusinesses: rejected
            });
        } catch (error) {
            res.status(500).json({ error: 'Error al cargar comercios' });
        }
    },

    getBusinessDocuments: (req, res) => {
        const { businessId } = req.params;

        db.all(`
            SELECT * FROM business_documents 
            WHERE business_id = ?
        `, [businessId], (err, documents) => {
            if (err) {
                return res.status(500).json({ error: 'Error al cargar documentos' });
            }
            res.json(documents);
        });
    },

    approveBusiness: (req, res) => {
        const { businessId } = req.params;
        const { notes } = req.body;

        db.run(`
            UPDATE businesses 
            SET status = 'approved', approval_notes = ?, approved_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [notes, businessId], (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error al aprobar comercio' });
            }
            
            // Send notification email to business
            sendBusinessApprovalEmail(businessId);
            res.json({ success: true });
        });
    },

    rejectBusiness: (req, res) => {
        const { businessId } = req.params;
        const { reason } = req.body;

        db.run(`
            UPDATE businesses 
            SET status = 'rejected', rejection_reason = ?
            WHERE id = ?
        `, [reason, businessId], (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error al rechazar comercio' });
            }
            
            // Send notification email to business
            sendBusinessRejectionEmail(businessId, reason);
            res.json({ success: true });
        });
    }
};

function getBusinessesByStatus(status) {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT b.*, bt.name as business_type
            FROM businesses b
            JOIN business_types bt ON b.business_type_id = bt.id
            WHERE b.status = ?
            ORDER BY b.created_at DESC
        `, [status], (err, businesses) => {
            if (err) reject(err);
            resolve(businesses);
        });
    });
}

module.exports = adminBusinessController;
