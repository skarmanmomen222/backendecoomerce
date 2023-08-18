const express = require("express")
const app = express()

const cors = require("cors")
const dotenv = require("dotenv")
const db = require("./config/database")
const cookieParser = require("cookie-parser")

const fileUpload = require("express-fileupload")

const error = require("./middlewares/error")
app.use(cors({
    origin: ["http://localhost:3000"],
    credentials: true
}))
app.use(express.urlencoded({ extended: true }))

app.use(express.json())

app.use(cookieParser())
// app.use(bodyparsers({ extended: true }))
app.use(fileUpload())

// routes
const productRoutes = require("./routes/productRoutes")
const UserRoutes = require("./routes/userRoute")
const orderRoutes = require("./routes/orderRoutes")
const paymentRoutes = require("./routes/paymentRoute")


// config
dotenv.config({ path: "./config/config.env" })

// db 
db.dbConnect(process.env.DBURL)

app.use("/api/v1", productRoutes)
app.use("/api/v1", UserRoutes)
app.use("/api/v1", orderRoutes)
app.use("/api/v1", paymentRoutes)


// error handler
app.use(error)

module.exports = app