const ErrorHandler = require("../utils/errorHandler")

const error = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500
    err.message = err.message || "Internal server error"


    // wrong mongodb error invalid id
    if(err.name === "CastError") {
        const msg = `invalid id from ${err.path}`
        err = new ErrorHandler(msg, 404)
        
    }

    // 
    if(err.code === 11000 ) {
        const msg = "email has been already decleared"
        err = new ErrorHandler(msg, 404)
    }
    if(err.name === "jsonWebTokenError") {
        const msg = "jwt token is invalid try again"
        err = new ErrorHandler(msg, 401)
    }
    if(err.name === "tokenExpiredError") {
        const msg = "jwt token is expired try again"
        err = new ErrorHandler(msg, 403)
    }

    // console.log("error stack", err.stack)
    res.status(err.statusCode).json({ success: false, error: err.message })
}
module.exports = error