const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { attachCookiesToResponse, createTokenUser } = require('../utils');

const register = async (req, res) => {
  // check for unique email
  const { email, name, password } = req.body;
  const emailAlreadyExists = await User.findOne({ email });

  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError('Email already exsist');
  }
  // first register as admin
  const isFirstAccount = await User.countDocuments({});
  let role = 'user';
  if (isFirstAccount === 0) {
    role = 'admin';
  }
  const user = await User.create({ email, name, password, role });
  const tokenUser = createTokenUser(user);
  attachCookiesToResponse(res, tokenUser);

  res.status(StatusCodes.CREATED).json({ user: tokenUser });
};
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new CustomError.BadRequestError('please provide email and password');
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.UnauthenticatedError('invalud credentials');
  }
  const checkPass = await user.comparePassword(password);
  if (!checkPass) {
    throw new CustomError.UnauthenticatedError('invalud credentials');
  }
  const tokenUser = createTokenUser(user);
  const cookie = attachCookiesToResponse(res, tokenUser);

  res.status(StatusCodes.OK).json({ user: tokenUser });
};
const logout = async (req, res) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: 'user loged out' });
};

module.exports = { register, login, logout };
