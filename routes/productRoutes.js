const { createProduct, getAllProducts, adminProductListGet, updateProduct, getProductDetails, deleteProduct, createProductReview, getReviews, deleteReview, products } = require("../controllers/productControllers")
const { isAuthenticatedUser, isAuthorizedRole } = require("../middlewares/auth")


const router = require("express").Router()

router.route("/allproducts").get(products)
router.route("/products").get(getAllProducts)
router.route("/admin/products").get(isAuthenticatedUser, isAuthorizedRole("admin"), adminProductListGet)
router.route("/admin/new/product").post(isAuthenticatedUser, isAuthorizedRole("admin"), createProduct) // admin
router.route("/admin/product/:id")
    .put(isAuthenticatedUser, isAuthorizedRole("admin"), updateProduct)  // admin
    .delete(isAuthenticatedUser, isAuthorizedRole("admin"), deleteProduct) // admin

router.route("/product/:id").get(getProductDetails)

// review
router.route("/review").post(isAuthenticatedUser, createProductReview)
router.route("/reviews").get(getReviews).delete(isAuthenticatedUser, deleteReview)

module.exports = router