const catchAsyncError = require("../middlewares/catchAsyncError")
const Product = require("../models/productModel")
const ApiFeatures = require("../utils/apiFeatures")
const cloudinary = require("cloudinary")
const ErrorHandler = require("../utils/errorHandler")


// create product --- admin
exports.createProduct = catchAsyncError(async (req, res, next) => {
    let images = []

    console.log(req.body.images)
    if (typeof req.body.images === "string") {
        images.push(req.body.images)
    }
    else {
        images = req.body.images
    }

    const imagesLinks = [];

    for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i], {
            folder: "products",
        });

        imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url,
        });
    }
    // console.log(imagesLink, "images")

    console.log(imagesLinks)
    req.body.images = imagesLinks
    req.body.user = req.user.id
    req.body.whoProductCreate = req.user.name
    const product = await Product.create(req.body)

    res.status(201).json({ success: true, product })
})

//  
exports.adminProductListGet = catchAsyncError(async (req, res, next) => {
    const productCounts = await Product.countDocuments()
    const products = await Product.find()
    res.status(200).json({ success: true, productCounts, products })

})


// get all products no other query for 
exports.products = catchAsyncError(async (req, res, next) => {


    const productCounts = await Product.countDocuments()
    const products = await Product.find()


    res.status(200).json({ success: true, productCounts, products })

})

// get all products
exports.getAllProducts = catchAsyncError(async (req, res, next) => {

    const resultPerPage = 20

    const productCounts = await Product.countDocuments()

    const apiFeatures = new ApiFeatures(Product.find(), req.query)
        .search()
        .filter()
        .pagination(resultPerPage);

    let products = await apiFeatures.query;

    let filteredProductCounts = products.length;


    // products = await apiFeatures.query;

    // let products = await apiFeatures.query
    // let filteredProductCounts = products.length

    // apiFeatures.pagination(resultPerPage)
    // products = await apiFeatures.query

    res.status(200).json({ success: true, productCounts, products, resultPerPage, filteredProductCounts })

})


//  update product details -------------- admin
exports.updateProduct = catchAsyncError(async (req, res, next) => {

    let product = await Product.findById(req.params.id)
    if (!product) {
        return next(new ErrorHandler("product not found", 404))
    }
    console.log("updatesdfsf")

    // Images Start Here
    let images = [];

    if (typeof req.body.images === "string") {
        images.push(req.body.images);
    } else {
        images = req.body.images;
    }

    if (images !== undefined) {
        // Deleting Images From Cloudinary
        for (let i = 0; i < product.images.length; i++) {
            await cloudinary.v2.uploader.destroy(product.images[i].public_id);
        }

        const imagesLinks = [];

        for (let i = 0; i < images.length; i++) {
            const result = await cloudinary.v2.uploader.upload(images[i], {
                folder: "products",
            });

            imagesLinks.push({
                public_id: result.public_id,
                url: result.secure_url,
            });
        }

        req.body.images = imagesLinks;
    }



    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })
    res.json({ success: true, product })

}
)

//  delete product details -------------- admin
exports.deleteProduct = catchAsyncError(async (req, res, next) => {

    let product = await Product.findById(req.params.id)
    // Deleting Images From Cloudinary
    for (let i = 0; i < product.images.length; i++) {
        await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }


    if (!product) {
        return next(new ErrorHandler("product not found", 404))
    }
    await Product.findByIdAndDelete(req.params.id)
    res.json({ success: true, msg: "product delete successfully." })


})

// get product details 
exports.getProductDetails = catchAsyncError(async (req, res, next) => {


    const product = await Product.findById(req.params.id)

    if (!product) {
        return next(new ErrorHandler("product not found", 404))
    }
    res.json({ success: true, product })

})

// create product review or update
exports.createProductReview = catchAsyncError(async (req, res, next) => {
    const { productId, comment, rating } = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating,
        comment
    }



    const product = await Product.findById(productId)

    const isReview = product.reviews.find(rev => rev.user.toString() === req.user._id.toString())


    if (isReview) {
        product.reviews.forEach((rev) => {
            if (rev.user.toString() === req.user.id.toString()) {
                rev.comment = comment,
                    rev.rating = rating
            }
        })
    }
    else {

        product.reviews.push(review)

        product.numOfReviews = product.reviews.length
    }
    let avg = 0;
    product.reviews.forEach((rev) => {
        avg += rev.rating
    })
    product.ratings = avg / product.reviews.length
    await product.save()
    res.status(201).json({ success: true, msg: `review created this ${req.user.name} ` })
})

// get all reviews
exports.getReviews = catchAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.query.productId)
    if (!product) {
        return next(new ErrorHandler("product not found!", 404))
    }
    res.status(200).json({ success: true, review: product.reviews })

})

// delete review 
exports.deleteReview = catchAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.query.productId)
    if (!product) {
        return next(new ErrorHandler("product not found!", 404))
    }
    const reviews = product.reviews.filter((rev) => rev._id.toString() !== req.query.id.toString())
    let avg = 0;
    reviews.forEach((rev) => avg += rev.rating)
    const ratings = avg / reviews.length;
    const numOfReviews = reviews.length

    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        ratings,
        numOfReviews
    }, { new: true, runValidators: true, useFindAndModify: false })

    res.status(200).json({ success: true, review: product.reviews })

})
