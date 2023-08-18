const mongoose = require("mongoose")

module.exports.dbConnect = async (url) => {
    try {
        const db = await mongoose.connect(url, {
       
        })
        console.log("database connect..........");
    } catch (error) {
        console.log(error.message);
    }
}
