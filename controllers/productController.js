const { StatusCodes } = require('http-status-codes');
const Product = require('../models/Product');
const CustomError = require('../errors');
const path = require('path');
const Review = require('../models/Review');
const createProduct = async (req, res) => {
  const userId = req.user.userId;
  req.body.user = userId;

  const product = await Product.create(req.body);
  res.status(StatusCodes.CREATED).json({ product });
};
const getAllProducts = async (req, res) => {
  const products = await Product.find({});
  if (!products) {
    throw new CustomError.NotFoundError(
      'there are no products , come back soon'
    );
  }
  res.status(StatusCodes.OK).json({ products, count: products.length });
};
const getSingleProduct = async (req, res) => {
  const ProductId = req.params.id;

  const product = await Product.findOne({ _id: ProductId }).populate('reviews');
  if (!product) {
    throw new CustomError.BadRequestError(
      `there are no products with this id : ${ProductId}`
    );
  }

  res.status(StatusCodes.OK).json({ product });
};
const updateProduct = async (req, res) => {
  const productId = req.params.id;
  const product = await Product.findOneAndUpdate({ _id: productId }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) {
    throw new CustomError.BadRequestError(
      `there are no products with this id : ${productId}`
    );
  }

  res.status(StatusCodes.OK).json({ product });
};
const deleteProduct = async (req, res) => {
  const productId = req.params.id;
  let product = await Product.findOne({ _id: productId });

  if (!product) {
    throw new CustomError.BadRequestError(
      `there are no products with this id : ${productId}`
    );
  }
  await Review.deleteMany({ product: product._id });
  await product.deleteOne();

  res.status(StatusCodes.OK).json({ deletedProduct: product });
};
const uploadImage = async (req, res) => {
  if (!req.files) {
    throw new CustomError.BadRequestError('No file uploaded');
  }
  const productImage = req.files.image;
  console.log(productImage);
  if (!productImage.mimetype.startsWith('image')) {
    throw new CustomError.BadRequestError('Please  Upload Image');
  }
  const maxSize = 1024 * 1024;
  if (productImage.size > maxSize) {
    throw new CustomError.BadRequestError(
      'Please  Upload Image smaller than 1MB'
    );
  }
  const imagePath = path.join(
    __dirname,
    '../public/uploads/' + `${productImage.name}`
  );
  await productImage.mv(imagePath);
  res.status(StatusCodes.OK).send({ image: `/uploads/${productImage.name}` });
};
const getSingleProductReviews = async (req, res) => {
  const { id: productId } = req.params;
  const reviews = await Review.find({ product: productId });
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};
module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
  getSingleProductReviews,
};
