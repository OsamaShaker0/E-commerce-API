const Order = require('../models/Order');
const CustomError = require('../errors');
const { StatusCodes } = require('http-status-codes');
const Product = require('../models/Product');
const checkPermissions = require('../utils/checkPermissions');
const getAllOrders = async (req, res) => {
  const orders = await Order.find({});
  if (orders.length === 0) {
    return res.status(StatusCodes.OK).json({ msg: 'there are no orders yets' });
  }
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};
const getSingleOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const order = await Order.findOne({ _id: orderId });
  console.log(order);
  if (!order) {
    throw new CustomError.NotFoundError(`No orders with id : ${orderId}`);
  }
  checkPermissions(req.user, order.user);
  res.status(StatusCodes.OK).json({ order });
};
const getCurrentUserOrders = async (req, res) => {
  const userId = req.user.userId;
  const orders = await Order.find({ user: userId });
  if (orders.length === 0) {
    return res.status(StatusCodes.OK).json({ msg: 'there are no orders yets' });
  }
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};
const createOrder = async (req, res) => {
  const { items: cartItem, tax, shippingFee } = req.body;
  if (!cartItem || cartItem.length < 1) {
    throw new CustomError.BadRequestError('No cart items provided');
  }
  if (!tax || !shippingFee) {
    throw new CustomError.BadRequestError('please provide tax and fees');
  }
  let orderItems = [];
  let subtotal = 0;
  for (const item of cartItem) {
    if (!item.product) {
      throw new CustomError.NotFoundError(`there is no product field`);
    }
    const dpProduct = await Product.findOne({ _id: item.product });

    if (!dpProduct) {
      throw new CustomError.NotFoundError(`No product with id ${item.product}`);
    }
    const { name, price, image, _id } = dpProduct;
    const singleOrderItem = {
      name,
      price,
      image,
      product: _id,
      amount: item.amount,
    };
    // add items to order
    orderItems = [...orderItems, singleOrderItem];
    // calc subtotal
    subtotal += item.amount * price;
  }
  await Order.create({
    orderItems,
    subtotal,
    total: subtotal + tax + shippingFee,
    shippingFee,
    tax,
    user: req.user.userId,
  });
  res.status(StatusCodes.OK).json({ msg: 'order created' });
};


module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
 
};
