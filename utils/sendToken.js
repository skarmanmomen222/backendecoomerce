
exports.sendToken = async (user, statusCode, res) => {
    const token = await user.getJwtToken()
    res.status(statusCode).cookie("token", token, {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    }).json({ success: true, user, token })
}