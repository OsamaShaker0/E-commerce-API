const Review = require('../models/Review');
const Product = require('../models/Product');
const CustomError = require('../errors');
const { StatusCodes } = require('http-status-codes');
const { checkPermissions } = require('../utils');

const createReview = async (req, res) => {
  const { product: productId } = req.body;
  const user = req.user.userId;
  req.body.user = user;
  //NOTE - chech if the product are exsist or not
  const isValidProduct = await Product.findOne({ _id: productId });
  if (!isValidProduct) {
    throw new CustomError.NotFoundError('No product with id ' + productId);
  }
  //NOTE - chech if the user alredy leave rating or not
  const alreadySubmitted = await Review.findOne({
    productId: productId,
    user: user,
  });
  if (alreadySubmitted) {
    throw new CustomError.BadRequestError(
      'already Submitted review for this product '
    );
  }

  const review = await Review.create(req.body);
  res.status(StatusCodes.CREATED).json({ review });
};
const getAllReviews = async (req, res) => {
  const reviews = await Review.find({})
    .populate({
      path: 'product',
      select: 'name price company',
    })
    .populate({
      path: 'user',
      select: 'name ',
    });

  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};
const getSingleReview = async (req, res) => {
  const reviewId = req.params.id;
  const review = await Review.findOne({ _id: reviewId });
  if (!review) {
    throw new CustomError.NotFoundError('No review for this product yet');
  }
  res.status(StatusCodes.OK).json({ review });
};
const updateReview = async (req, res) => {
  const { rating, title, comment } = req.body;
  if (!rating || !title || !comment) {
    throw new CustomError.BadRequestError(
      'please provide title , comment and reating'
    );
  }

  const reviewId = req.params.id;
  const review = await Review.findOne({ _id: reviewId });
  if (!review) {
    throw new CustomError.NotFoundError(
      'Not found review with this id:' + reviewId
    );
  }
  checkPermissions(req.user, review.user);

  review.rating = rating;
  review.title = title;
  review.comment = comment;

  review.save();

  res.status(StatusCodes.OK).json({ review });
};
const deleteReview = async (req, res) => {
  const reviewId = req.params.id;

  const review = await Review.findOne({ _id: reviewId });
  if (!review) {
    throw new CustomError.NotFoundError(
      'Not found review with this id:' + reviewId
    );
  }

  checkPermissions(req.user, review.user);
  await review.deleteOne()
  res.status(StatusCodes.OK).json({ msg: 'review deleted ' });
};
const deleteAllReviews = async (req,res) => {
  if (req.user.role !== 'admin') {
    throw new CustomError.UnauthorizedError(
      'you not allowed to access thsi route'
    );
  }
  await Review.deleteMany({});
  res.status(StatusCodes.OK).json({ msg: 'all reviews deleted ' });
};

module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  deleteAllReviews,
};
