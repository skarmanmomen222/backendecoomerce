const User = require("../models/userModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("./catchAsyncError");
const jwt = require("jsonwebtoken")
      
exports.isAuthenticatedUser = catchAsyncError(async (req, res, next) => {
    const { token } = req.cookies;


    if (!token) {
        return next(new ErrorHandler("please login fast", 401))
    }
    const tokenverify = await jwt.verify(token, process.env.JWT_SECRET_KEY)
    if (!tokenverify) {
        return next(new ErrorHandler("invalid token", 401))
    }
    req.user = await User.findById(tokenverify.id)

    next()


})
exports.isAuthorizedRole = (...role) => {

    return (req, res, next) => {
        if (!role.includes(req.user.role)) {
            return next(new ErrorHandler(`Role: ${req.user.role} is not allowd access this source`), 403)
        }
        next()
    }
}
