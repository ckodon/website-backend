const ErrorHandler = require("../helpers/ErrorHandler");
const CatchAsyncErrors = require("./CatchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.isAuthenticated = CatchAsyncErrors(async (req, res, next) => {
  const {x_user_auth_v1}  = req.cookies

  if (!x_user_auth_v1) {
    return next(new ErrorHandler("Please you must login first", 400));
  }
  const decoded = jwt.verify(x_user_auth_v1, process.env.JWT_SECRET_KEY);
  req.user = await User.findById(decoded.id);
  next();
});

