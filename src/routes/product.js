import express from "express"
const router=express.Router()
import { verifyJWT } from "../middlewares/auth.middlewares.js"
import { addProduct, addReview, adminDeleteSingleProduct, adminGetAllProduct, adminupdateSingleProduct, deleteReview, getOnlyReviewsForOneProduct, getSingleProduct } from "../controllers/product.controller.js"
import { adminUpdateSingleUserDetails } from "../controllers/user.controller"


router.route("/add-review").patch(verifyJWT,addReview)
router.route("/delete-review").delete(verifyJWT,deleteReview)
router.route("/reviews").get(verifyJWT,getOnlyReviewsForOneProduct)

router.route("/admin/product/add").post(verifyJWT,customRole("admin"),addProduct)
router.route("/admin/products").get(verifyJWT,customRole("admin"),adminGetAllProduct)
router.route("/product/:id").get(getSingleProduct)
router.route("/admin/update/product/:id").patch(verifyJWT,customRole("admin"),adminupdateSingleProduct)
router.route("/admin/delete/product/:id").delete(verifyJWT,customRole("admin"),adminDeleteSingleProduct)

export {router}
