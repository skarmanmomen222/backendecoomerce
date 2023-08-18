const catchAsyncError = require("../middlewares/catchAsyncError");
const Order = require("../models/orderModel");
const Product = require("../models/productModel")
const ErrorHandler = require("../utils/errorHandler");

// Create new Order
exports.newOrder = catchAsyncError(async (req, res, next) => {
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    } = req.body;

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt: Date.now(),
        user: req.user._id,
    });

    res.status(201).json({
        success: true,
        order,
    });
});


// // get logged in user  Orders
exports.getMyorders = catchAsyncError(async (req, res, next) => {
    const orders = await Order.find({ user: req.user._id })
    if (!orders) {
        return next(new ErrorHandler("order not found ", 404))
    }
    res.status(200).json({ success: true, orders })
})

// get single order 
exports.getSingleOrder = catchAsyncError(async (req, res, next) => {
    if (!req.params.id) {
        return next(new ErrorHandler("order Id required", 404));
    }

    const order = await Order.findById(req.params.id).populate(
        "user",
        "name email"
    ); console.log(order)

    if (!order) {
        return next(new ErrorHandler("Order not found with this Id", 404));
    }

    res.status(200).json({
        success: true,
        order,
    });

})

// get all Orders -- Admin
exports.getAllOrders = catchAsyncError(async (req, res, next) => {
    const orders = await Order.find()
    let totalAmount = 0;
    orders.forEach((order) =>
        totalAmount += order.totalPrice)

    res.status(200).json({
        success: true,
        totalAmount,
        orders,
    });
})

// update Order Status -- Admin
exports.orderStatusUpdate = catchAsyncError(async (req, res, next) => {
    const order = await Order.findById(req.params.id)
    if (!order) {
        return next(new ErrorHandler("Order not found with this Id", 404));
    }

    if (order.orderStatus === "Delivered") {
        return next(new ErrorHandler("You have already delivered this order", 404))
    }
    if (req.body.orderStatus === "Shipped") {
        order.orderItems.forEach(async (order) => {
            await updateStock(order.product, order.quantity)
        })
    }

    order.orderStatus = req.body.orderStatus
    if (req.body.status === "Delivered") {
        order.deliveredAt = Date.now();
    }
    await order.save({ validateBeforeSave: false });
    res.status(200).json({
        success: true,
    });

})
const updateStock = async (product, quantity) => {
    let pdt = await Product.findById(product)

    pdt.stock = pdt.stock - quantity
    await pdt.save({ validateBeforeSave: false });
}

// delete Order -- Admin
exports.deleteOrder = catchAsyncError(async (req, res, next) => {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
        return next(new ErrorHandler("Order not found with this Id", 404));
    }



    res.status(200).json({
        success: true,
        order
    });
});