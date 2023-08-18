const catchAsyncError = require("../middlewares/catchAsyncError")
const User = require("../models/userModel")
const ErrorHandler = require("../utils/errorHandler")
const { sendEmail } = require("../utils/sendEmail")
const { sendToken } = require("../utils/sendToken")
const crypto = require("crypto")
const cloudinary = require("cloudinary")
// register user
exports.register = catchAsyncError(async (req, res, next) => {


    const mycloudinary = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 150,
        crop: "scale"
    })

    const { name, email, password,
    } = req.body;

    const user = await User.create({
        name, email, password,
        avatar:
        {
            public_id: mycloudinary.public_id ? mycloudinary.public_id : "admin.png",
            url: mycloudinary.secure_url ? mycloudinary.secure_url : "admin.png"
        }
    })

    const token = await user.getJwtToken()

    res.status(201).json({ success: true, token }).cookie("token", token, {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    }).json({ success: true, user, token })

})

// login user
exports.login = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new ErrorHandler("email and password field required!"))
    }
    const user = await User.findOne({ email }).select("+password")
    if (!user) {
        return next(new ErrorHandler("invalid creadentials", 404))
    }
    const isPasswordMatched = await user.comparePassword(password)
    if (!isPasswordMatched) {
        return next(new ErrorHandler("invalid email or password", 404))
    }



    sendToken(user, 200, res)


})

// logout user
exports.logout = catchAsyncError(async (req, res, next) => {
    res.cookie("token", null, { expires: new Date(Date.now()), httpOnly: true })
    res.status(200).json({ success: true, msg: "Logout successfully" })

})

// forgot password
exports.resetPassword = catchAsyncError(async (req, res, next) => {


    const user = await User.findOne({ email: req.body.email })

    if (!user) {
        return next(new ErrorHandler("user not found", 404))
    }

    const reset_token = await user.getResetToken()
    console.log(reset_token)

    await user.save({ validateBeforeSave: false })

    const resetPasswordURl = `${process.env.FRONTED_URL}password/reset/token/${reset_token}`
    const message = `Your password reset token is \n\n ${resetPasswordURl} \n\n if you have not requested this email, please igonore it `

    try {
        await sendEmail({
            email: user.email,
            subject: "Curtfashion.com password recovery",
            message,

        })

        res.status(200).json({ success: true, msg: `email sent to ${user.email}` })

    } catch (error) {
        user.resetPasswordToken = undefined
        user.resetPaswordExpire = undefined
        await user.save()
        return next(new ErrorHandler(error.message, 500))
    }
})

// reset password token verify and change password
exports.resetPasswordTokenVerify = catchAsyncError(async (req, res, next) => {
    const { password, cPassword } = req.body;
    if (!password || !cPassword) {
        return next(new ErrorHandler("fields required", 404))
    }
    if (password !== cPassword) {
        return next(new ErrorHandler("password does not matched", 404))
    }

    const resetToken = crypto.createHash("sha256").update(req.params.token).digest("hex")

    const user = await User.findOne({
        resetPasswordToken: resetToken,
        resetPaswordExpire: { $gt: Date.now() }
    }).select("+password")


    if (!user) {
        return next(new ErrorHandler("invalid reset token or token is expired", 401))
    }


    user.password = password
    user.resetPasswordToken = undefined
    user.resetPaswordExpire = undefined
    user.save()
    sendToken(user, 201, res)

})

// get user details
exports.getUserDetails = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id)
    if (!user) {
        return next(new ErrorHandler("user not found!", 404))
    }
    res.status(200).json({ success: true, user })
})

// passowrd update
exports.updatePassword = catchAsyncError(async (req, res, next) => {
    const { oldPassword, newPassword, cPassword } = req.body;
    if (!oldPassword || !newPassword || !cPassword) {
        return next(new ErrorHandler("Password fields required", 404))
    }
    if (newPassword !== cPassword) {
        return next(new ErrorHandler("Password does not match!", 404))
    }

    const user = await User.findById(req.user.id).select("+password")
    if (!user) {
        return next(new ErrorHandler("user not found!", 404))
    }
    const isPasswordMatched = await user.comparePassword(oldPassword)

    if (!isPasswordMatched) {
        return next(new ErrorHandler("old password is incorrect", 404))
    }
    user.password = newPassword
    await user.save()
    sendToken(user, 201, res)
})

// update user profile
exports.updateUserProfile = catchAsyncError(async (req, res, next) => {

    const isEmailExist = await User.findOne({ email: req.body.email })
    if (!isEmailExist) {
        return next(new ErrorHandler("Try another email!", 404))
    }
    if (req.body.avatar !== "") {
        const user = await User.findById(req.user.id)
        const imageid = user.avatar.public_id
        await cloudinary.v2.uploader.destroy(imageid)
    }
    const mycloudinary = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 150,
        crop: "scale"
    })

    const newUserData = {
        email: req.body.email,
        name: req.body.name
    }
    newUserData.avatar = {
        public_id: mycloudinary.public_id,
        url: mycloudinary.url
    }


    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        validators: true,
        useFindAndModify: false
    })
    if (!user) {
        return next(new ErrorHandler("user not found!", 404))
    }
    res.status(201).json({ success: true, user, msg: "user profile updated" })
})

// update user profile Admin
exports.updateUserRole = catchAsyncError(async (req, res, next) => {
    const newUserData = {
        email: req.body.email,
        name: req.body.name,
        role: req.body.role
    }
    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        validators: true,
        useFindAndModify: false
    })
    if (!user) {
        return next(new ErrorHandler("user not found!", 404))
    }
    res.status(201).json({ success: true, user, msg: "user role updated" })
})

// delete user Admin
exports.deleteUser = catchAsyncError(async (req, res, next) => {

    const user = await User.findByIdAndRemove(req.params.id)
 
    if (!user) {
        return next(new ErrorHandler("user not found!", 404))
    }
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    res.status(200).json({ success: true, user, msg: "user deleted " })
})

// get all user by admin
exports.allUsers = catchAsyncError(async (req, res, next) => {

    const users = await User.find()
    res.status(200).json({ success: true, users })
})

// getSingleUser

exports.getSingleUser = catchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.params.id)
    if (!user) {
        return next(new ErrorHandler("user not found!", 404))
    }
    res.status(200).json({ success: true, user })
})
