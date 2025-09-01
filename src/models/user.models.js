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
    if(!this.modified("password")) return next() //We only need this hashing logic to run when only the password field is being saved the first time or being modified in the database

    this.password = bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return bcrypt.compare(password, this.password)
}

export const User = mongoose.model("User", userSchema) 
/*creates a table/document in the mongodb database
 names user and having the structure defined in userSchema
*/