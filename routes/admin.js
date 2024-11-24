const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAdmin } = require('../middleware/auth');

// Apply admin middleware to all routes
router.use(isAdmin);

// Dashboard routes
router.get('/', adminController.getDashboard);
router.get('/users', adminController.getUsers);
router.get('/businesses', adminController.getBusinesses);

// User management
router.put('/users/:userId/status', adminController.toggleUserStatus);
router.delete('/users/:userId', adminController.deleteUser);

// Business management
router.put('/businesses/:businessId/status', adminController.toggleBusinessStatus);
router.delete('/businesses/:businessId', adminController.deleteBusiness);

// Reports
router.get('/reports/sales', adminController.getSalesReport);
router.get('/reports/users', adminController.getUsersReport);
router.get('/reports/businesses', adminController.getBusinessesReport);

module.exports = router;
