const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { createTokenUser, attachCookiesToResponse ,checkPermissions} = require('../utils');

const getAllUsers = async (req, res) => {
  const users = await User.find({ role: 'user' }).select('-password');
  if (users.length === 0) {
    throw new CustomError.NotFoundError('there are no users ');
  }
  res.status(StatusCodes.OK).json({ users });
};
const getSingleUser = async (req, res) => {
  const userId = req.params.id;
  const user = await User.findOne({ _id: userId }).select('-password');
  if (!user) {
    throw new CustomError.NotFoundError(
      `there is no user with this id : ${userId}`
    );
  }
  checkPermissions(req.user, user._id);
  res.status(StatusCodes.OK).json({ user });
};
const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};
const updateUser = async (req, res) => {
  const { email, name } = req.body;
  if (!email || !name) {
    throw new CustomError.BadRequestError('please provide name and email');
  }
  const user = await User.findOneAndUpdate(
    { _id: req.user.userId },
    { email, name },
    {
      new: true,
      runValidators: true,
    }
  );
  const tokenUser = createTokenUser(user);
  
  attachCookiesToResponse(res, tokenUser);
  res.status(StatusCodes.OK).json({ user: tokenUser });
};
const updateUserPassword = async (req, res) => {
  let { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError(
      'please provide old password and new one '
    );
  }
  let user = await User.findOne({ _id: req.user.userId });

  const match = user.comparePassword(oldPassword);
  if (!match) {
    throw new CustomError.UnauthenticatedError('Invalid credentatil ');
  }
  user.password = newPassword;
  user.save();

  res.status(StatusCodes.OK).json({ msg: 'your password is updated' });
};
module.exports = {
  getAllUsers,
  getSingleUser,
  updateUser,
  showCurrentUser,
  updateUserPassword,
};
