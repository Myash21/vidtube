import { Router } from "express";
import { registerUser, logoutUser, loginUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, 
    getUserChannelProfile, getWatchHistory, updateAccountDetails, updateAvatar, 
    updateCoverImage} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router()

//unsecured routes(anyone can access them)
router.route("/register").post( //.post(middleware, controller)
    //inject upload middleware
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser)

router.route("/login").post(loginUser)
router.route("/refresh-token").post(refreshAccessToken)

//secured routes
router.route("/logout").post(verifyJWT, logoutUser) //.post(middleware, controller)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/channel/:username").get(verifyJWT, getUserChannelProfile)
router.route("/watchHistory").get(verifyJWT, getWatchHistory)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)
router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateAvatar)
router.route("/update-coverImage").patch(verifyJWT, upload.single("coverImage"), updateCoverImage)

export default router;