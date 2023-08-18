const express = require("express")
const { register, login, logout, resetPassword, resetPasswordTokenVerify, getUserDetails, updatePassword, updateUserRole, updateUserProfile, deleteUser, allUsers, getSingleUser } = require("../controllers/userControllers")
const { isAuthenticatedUser, isAuthorizedRole } = require("../middlewares/auth")
const router = express.Router()

router.route("/register").post(register)
router.route("/login").post(login)
router.route("/logout").get(logout)
router.route("/password/forgot").post(resetPassword)
router.route("/password/reset/token/:token").put(resetPasswordTokenVerify)

router.route("/password/update").put(isAuthenticatedUser, updatePassword)
router.route("/me").get(isAuthenticatedUser, getUserDetails)
router.route("/me/update").put(isAuthenticatedUser, updateUserProfile)

router.route("/admin/users").get(isAuthenticatedUser, isAuthorizedRole("admin"), allUsers)
router.route("/admin/user/:id")
    .put(isAuthenticatedUser, isAuthorizedRole("admin"), updateUserRole)
    .delete(isAuthenticatedUser, isAuthorizedRole("admin"), deleteUser)
    .get(isAuthenticatedUser, isAuthorizedRole("admin"), getSingleUser)


module.exports = router  