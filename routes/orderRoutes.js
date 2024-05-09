const express = require('express');
const router = express.Router();

const {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,

} = require('../controllers/orderController');
const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');

router
  .route('/')
  .get(authenticateUser, authorizePermissions('admin'), getAllOrders)
  .post(authenticateUser,createOrder);
router.route('/showAllMyOrders').get(authenticateUser,getCurrentUserOrders);
router.route('/:id').get(authenticateUser,getSingleOrder)

module.exports = router;
