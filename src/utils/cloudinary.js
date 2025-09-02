import { v2 as cloudinary } from 'cloudinary';
import dotenv from "dotenv"
import fs from 'fs'
dotenv.config()

//cloudinary config
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadOnCloudinary = async (localfilepath) => {
    try {
        if(!localfilepath) return null
        const response = await cloudinary.uploader.upload(
            localfilepath, {
                resource_type: "auto"
            }
        )
        console.log("File uploaded on Cloudinary! File src: " + response.url)
        //Once the file is uploaded, we would like to delete it from our local server
        fs.unlinkSync(localfilepath)
        return response
    } 
    catch (error) {
        //If an error occurs while uploading we would like to remove it from our local server too
        fs.unlink(localfilepath)
        return null
    }
}