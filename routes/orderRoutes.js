const { newOrder, getMyorders, getAllOrders, getSingleOrder, orderStatusUpdate, deleteOrder } = require("../controllers/orderController")
const { isAuthenticatedUser, isAuthorizedRole } = require("../middlewares/auth")

const router = require("express").Router()

router.route("/order/new").post(isAuthenticatedUser, newOrder)
router.route("/order/me") .get(isAuthenticatedUser, getMyorders)
router.route("/order/:id").get(isAuthenticatedUser, getSingleOrder)
router.route("/admin/orders").get(isAuthenticatedUser, isAuthorizedRole("admin"), getAllOrders)
router.route("/admin/order/:id").post(isAuthenticatedUser, isAuthorizedRole("admin"), orderStatusUpdate).delete(isAuthenticatedUser, isAuthorizedRole("admin"), deleteOrder)


module.exports = router