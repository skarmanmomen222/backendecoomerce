const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "please enter your name"]
    },
    email: {
        type: String,
        required: [true, "please enter your email"],
        unique: true,
        validate: [validator.isEmail, "please enter a valid email"]

    },
    password: {
        type: String,
        required: [true, "please enter your password plse"],
        select: false,
    }
    ,
    avatar: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    role: {
        type: String,
        default: "user"
    },
    resetPasswordToken: String,
    resetPaswordExpire: Date
},
{
    timestamps: true
}
)

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next()
    }
    this.password = await bcrypt.hash(this.password, 10)
})

// compare password with hashpassword
userSchema.methods.comparePassword = async function (pass) {
    return await bcrypt.compare(pass, this.password)
}

// jwt token create
userSchema.methods.getJwtToken = async function () {
    return await jwt.sign({ id: this.id }, process.env.JWT_SECRET_KEY, {
        expiresIn: "5d"
    })
}

// reset token 
userSchema.methods.getResetToken = async function () {
    const token = crypto.randomBytes(10).toString("hex")
    const resetToken = crypto.createHash("sha256").update(token).digest("hex")
    this.resetPasswordToken = resetToken
    this.resetPaswordExpire = new Date(Date.now() + 24 * 60 * 1000)
   
    return token
}

module.exports = mongoose.model("User", userSchema, "user_mern")