import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { deleteVideo, getAllVideos, getVideoById, publishAVideo, updateVideo } from "../controllers/video.controllers.js";

const router = Router()
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/getAll").get(getAllVideos)

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

router.route("/delete-video/:videoId").delete(deleteVideo)

export default router;