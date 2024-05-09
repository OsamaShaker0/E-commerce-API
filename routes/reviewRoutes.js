const express = require('express');
const router = express.Router();
const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication');
const {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  deleteAllReviews
} = require('../controllers/reviewController');

router.route('/')
  .post(authenticateUser,  createReview)
  .get(getAllReviews);
  router.route('/deleteAll').delete(authenticateUser,deleteAllReviews)
  router
  .route('/:id')
  .get(getSingleReview)
  .patch(authenticateUser, updateReview)
  .delete(authenticateUser, deleteReview);


module.exports = router;