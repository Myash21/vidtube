/*
  id string pk
  username string
  email string
  fullname string
  avatar string
  coverImage string
  watchHistory ObjectID[] videos
  password string
  refreshToken string
  createdAt Date
  updatedAt Date
*/

import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        fullname: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String,
            required: true
        },
        coverImage: {
            type: String
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, "password is required"]
        },
        refreshToken: {
            type: String
        }
    },
    { timestamps: true }
)

userSchema.pre("save", async function(next){ //Here we are using a prehook which is middleware used to process the data before saving it to the database, in this case we are encrypting the password before saving it to the database
    if(!this.isModified("password")) return next() //We only need this hashing logic to run when only the password field is being saved the first time or being modified in the database

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

const access_secret = process.env.JWT_SECRET_ACCESS_TOKEN
const access_time = process.env.ACCESS_TOKEN_EXPIRY_TIME
userSchema.methods.generateAccessToken = function(){ //Generating an access token using jwt which is used to validate that the user has successfully logged in
    //short lived access token (user can remain logged in for a short amount of time)
    var token = jwt.sign(           //jwt.sign(data, secret, expiresin)
        { 
            _id: this._id,
            email: this.email,
            username: this.username 
        },
         access_secret,
        {expiresIn: access_time});
        return token
}

const refresh_secret = process.env.JWT_SECRET_REFRESH_TOKEN
const refresh_time = process.env.REFRESH_TOKEN_EXPIRY_TIME
//An access token grants temporary, limited access to a resource, while a refresh token is a long-lived token used to obtain a new access token when the old one expires
userSchema.methods.generateRefreshToken = function(){
    var token = jwt.sign(           //jwt.sign(data, secret, expiresin)
        { 
            _id: this._id
        },
         refresh_secret,
        {expiresIn: refresh_time});
    return token
}

export const User = mongoose.model("User", userSchema) 
/*creates a table/document in the mongodb database
 names user and having the structure defined in userSchema
*/