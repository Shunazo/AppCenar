const db = require('../config/database');
const multer = require('multer');
const path = require('path');

// Configure multer for different file types
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        let uploadPath = 'public/uploads/';
        if (file.fieldname === 'logo') {
            uploadPath += 'logos';
        } else {
            uploadPath += 'documents';
        }
        cb(null, uploadPath);
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

const businessRegistrationController = {
    showRegistrationForm: (req, res) => {
        db.all('SELECT * FROM business_types', [], (err, businessTypes) => {
            if (err) {
                return res.status(500).json({ error: 'Error al cargar tipos de comercio' });
            }
            res.render('business/register', { businessTypes });
        });
    },

    registerBusiness: [
        upload.fields([
            { name: 'logo', maxCount: 1 },
            { name: 'rnc_document', maxCount: 1 },
            { name: 'mercantile_document', maxCount: 1 }
        ]),
        async (req, res) => {
            const {
                name, business_type_id, rnc, address, email,
                phone, opening_time, closing_time
            } = req.body;

            db.serialize(() => {
                db.run('BEGIN TRANSACTION');

                db.run(`
                    INSERT INTO businesses (
                        name, business_type_id, rnc, address, email,
                        phone, opening_time, closing_time, logo, status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
                `, [
                    name, business_type_id, rnc, address, email,
                    phone, opening_time, closing_time,
                    '/uploads/logos/' + req.files.logo[0].filename
                ], function(err) {
                    if (err) {
                        db.run('ROLLBACK');
                        return res.status(500).json({ error: 'Error al registrar comercio' });
                    }

                    const businessId = this.lastID;
                    const documents = [
                        {
                            type: 'RNC',
                            path: '/uploads/documents/' + req.files.rnc_document[0].filename
                        },
                        {
                            type: 'Registro Mercantil',
                            path: '/uploads/documents/' + req.files.mercantile_document[0].filename
                        }
                    ];

                    const documentValues = documents.map(doc => 
                        `(${businessId}, '${doc.type}', '${doc.path}')`
                    ).join(',');

                    db.run(`
                        INSERT INTO business_documents (business_id, document_type, file_path)
                        VALUES ${documentValues}
                    `, [], (err) => {
                        if (err) {
                            db.run('ROLLBACK');
                            return res.status(500).json({ error: 'Error al guardar documentos' });
                        }

                        db.run('COMMIT');
                        res.json({ 
                            success: true, 
                            message: 'Comercio registrado exitosamente. Pendiente de aprobación.' 
                        });
                    });
                });
            });
        }
    ]
};

module.exports = businessRegistrationController;
