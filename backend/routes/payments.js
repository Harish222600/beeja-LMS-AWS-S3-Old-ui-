const express = require('express');
const router = express.Router();

const { capturePayment, verifyPayment, getPurchaseHistory } = require('../controllers/payments');
const { getOrderByCourse } = require('../controllers/order');
const { auth, isAdmin, isInstructor, isStudent } = require('../middleware/auth');

router.post('/capturePayment', auth, isStudent, capturePayment);
router.post('/verifyPayment', auth, isStudent, verifyPayment);
router.get('/purchaseHistory', auth, isStudent, getPurchaseHistory);
router.get('/order/course/:courseId', auth, isStudent, getOrderByCourse);

module.exports = router
