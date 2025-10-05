import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares";
import { upload } from "../middlewares/multer.middlewares";
import { publishAVideo } from "../controllers/video.controllers";

const router = Router()

router.route("/register-video").post(
    verifyJWT,
    upload.fields([
        {
            name: video,
            maxCount: 1
        },
        {
            name: thumbnail,
            maxCount: 1
        }
    ]),
    publishAVideo)