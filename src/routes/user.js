import { Router } from "express";
const router=Router();
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { customRole } from "../middlewares/auth.middlewares.js";
import { adminDeleteSingleUserDetails, adminSingleUser, adminUpdateSingleUserDetails, changeCurrentPassword, forgetPassword, getCurrentUser, loginUser, logoutuser, passwordReset,  registerUser, updateAccountDetails, updateUserPhoto } from "../controllers/user.controller.js";


router.route("/register").post(
    upload.fields([
        {
           name:'photo',
           maxCount:1 
        }
    ]),
    registerUser)
router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT,logoutuser)
router.route("/change-password").post(verifyJWT,changeCurrentPassword)
router.route("/current-user").get(verifyJWT,getCurrentUser)
router.route("/update-account").patch(verifyJWT,updateAccountDetails)
router.route("/photo").patch(verifyJWT,upload.single('photo'),updateUserPhoto)
router.route("/forgotPassword").post(forgetPassword)
router.route("/password/:token").post(passwordReset)

router.route("/admin/user/:id").get(verifyJWT,customRole('admin'),adminSingleUser)
router.route("/admin/update/user/:id").put(verifyJWT,customRole('admin'),adminUpdateSingleUserDetails)
router.route("/admin/delete/user/:id").delete(verifyJWT,customRole('admin'),adminDeleteSingleUserDetails)

export default router


