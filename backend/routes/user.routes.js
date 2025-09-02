import express from "express"

import { asktoAssistant, getCurrentUser, updateAssistant } from "../controllers/user.controller.js"
import isAuth from "../middlewares/isAuth.js"
import upload from "../middlewares/multer.js"
import { connect } from "mongoose"
import { connectArduino } from "../controllers/aurdino.js"
const userRouter=express.Router()


userRouter.get("/current",isAuth,getCurrentUser)
userRouter.post("/UpdateAssistant",isAuth,upload.single("assistantImage"),updateAssistant)
userRouter.post("/askAssistant",isAuth,asktoAssistant)


export default userRouter