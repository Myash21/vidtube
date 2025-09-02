import { v2 as cloudinary } from 'cloudinary';
import dotenv from "dotenv"
import fs from 'fs'
dotenv.config()


console.log(process.env.CLOUDINARY_CLOUD_NAME)
console.log(process.env.CLOUDINARY_API_KEY)
console.log(process.env.CLOUDINARY_API_SECRET)
//cloudinary config
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadOnCloudinary = async (localfilepath) => {
    try {
        if(!localfilepath) {
            console.log("local file path not found by uploadOnCloudinary function")
            return null
        }
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
        console.log("error occured in cloudinary.js")
        fs.unlinkSync(localfilepath)
        return null
    }
}

export const deleteFromCloudinary = async(publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId)
        console.log("deleted from cloudinary", publicId)
    } catch (error) {
        console.log("Error deleting from cloudinary!", error)
        return null
    }
}