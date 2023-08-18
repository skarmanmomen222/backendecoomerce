const app = require("./app")
const cloudinary = require('cloudinary')

// Handling Uncaught Exception
process.on("uncaughtException", (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to Uncaught Exception`);
    process.exit(1);
});

cloudinary.config({
    cloud_name: 'dci9zgwp9',
    api_key: '917567679211637',
    api_secret: 'geIFKxt0f3-jnKwVr1duq7F9jR8',
    secure: true
});

const server = app.listen(process.env.PORT, (err) => {
    if (err) {
        console.log("server error ", err)
    }
    console.log(`server working on port : ${process.env.PORT}`)
})

process.on("unhandledRejection", err => {
    console.log(`Error ${err}.message`)
    console.log(`Shutting down the server due to Unhandled Promise Rejection`);
    server.close(() => {
        process.exit(1);
    })
})