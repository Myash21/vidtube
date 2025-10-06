import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares";
import { upload } from "../middlewares/multer.middlewares";
import { getVideoById, publishAVideo, updateVideo } from "../controllers/video.controllers";

const router = Router()
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/register-video").post(
    upload.fields([
        {
            name: "video",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    publishAVideo
)

router.route("/getVideobyId/:videoId").get(getVideoById)

router.route("/update-videoinfo/:videoId").patch(
    upload.single("thumbnail"),
    updateVideo
)