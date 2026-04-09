import express from "express"
import { getProgress } from "../services/video.service.js"
import { requireAuth } from "../middleware/auth.middleware.js"

const router = express.Router()

router.get("/:userId",requireAuth,(req,res)=>{

const {userId} = req.params

console.log("progress requested",userId)

const progress = getProgress(userId)

res.json(progress)

})

export default router