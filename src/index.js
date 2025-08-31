import { app } from "./app.js";
import dotenv from "dotenv"
import connectdb from "./db/index.js";
dotenv.config()

const PORT = process.env.PORT
connectdb()
.then(() => {
    app.listen(PORT, () => {
    console.log("Server is running!")
})
})
.catch((err) => {
    console.log("MongoDB connection error!", err)
})