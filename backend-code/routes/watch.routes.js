const express = require('express')
const router = express.Router()

const { kshitij, kshitijSubscriptions, videos } = require('../model/db')

const controller = require('../controller/watch.controller')

const {authenticationMiddleware} = require('../middleware/authentication.middleware')

router.use(authenticationMiddleware)

router.get('/', controller.getVideoDetails)

router.post('/', controller.postComment)

router.put('/', controller.editComment)

// router.delete('/watch', (req, res)=>{
//     const videoId = req.query.v;
//     const {user} = req.body;

//     let commentFound = false;

//     for(let i = 0; i < videos.length; i++){
//         if(videoId === videos[i].videoId){
//             for(let j = 0; j < videos[i].comments.length; j++){
//                 if(user === videos[i].comments[j].user){
//                     videos[i].comments[j].isDeleted = true;

//                     commentFound = true;
//                 }
//             }

//         }  
//     }

//     if(commentFound){
//         res.status(204).json({
//             message: "Comment Deleted!"
//         })
//     }
//     else{
//         res.status(400).json({
//             message: "Couldn't Delete Comment"
//         })
//     }
// })


router.delete('/', controller.deleteComment)

module.exports = router;