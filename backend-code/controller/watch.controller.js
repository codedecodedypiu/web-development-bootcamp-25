const { videos } = require('../model/db')

exports.getVideoDetails= (req, res)=>{
    const videoId = req.query.v;
    let video;

    for(let i = 0; i < videos.length; i++){
        if(videoId === videos[i].videoId){
            video = videos[i];
        }
    }
    
    if(video){
        video['commentCount'] = video.comments.length;
        res.status(200).json(video)
    }
    else{
        res.status(404).json({
            message: "This video isn't available anymore"
        })
    }  
    
}

exports.postComment = (req, res)=>{
    const videoId = req.query.v;
    const {user, commentedOn, data} = req.body; //object destructuring
    let index = -1;

    for(let i = 0; i < videos.length; i++){
        if(videoId === videos[i].videoId){
            index = i;
        }
    }
    
    if(index > -1){
        videos[index]["comments"].push({
            user,
            commentedOn,
            data
        })
        res.status(201).json({
            message: "Comment Posted!"
        })
    }
    else{
        res.status(400).json({
            message: "Couldn't Post Comment"
        })
    }
}

exports.editComment = (req, res)=>{
    const videoId = req.query.v;
    const {user, commentedOn, data} = req.body;

    let commentFound = false;

    for(let i = 0; i < videos.length; i++){
        if(videoId === videos[i].videoId){
            for(let j = 0; j < videos[i].comments.length; j++){
                if(user === videos[i].comments[j].user){
                    videos[i].comments[j].commentedOn = commentedOn;
                    videos[i].comments[j].data = data;
                    videos[i].comments[j].isEdited = true;


                    commentFound = true;
                }
            }

        }
    }

    if(commentFound){
        res.status(201).json({
            message: "Comment Edited!"
        })
    }
    else{
        res.status(400).json({
            message: "Couldn't Edit Comment"
        })
    }

}

exports.deleteComment = (req, res)=>{
    const videoId = req.query.v;
    const {user} = req.body;

    let commentFound = false;

    for(let i = 0; i < videos.length; i++){
        if(videoId === videos[i].videoId){
            for(let j = 0; j < videos[i].comments.length; j++){
                if(user === videos[i].comments[j].user){
                    videos[i].comments.splice(j, 1)

                    commentFound = true;
                }
            }

        }  
    }

    if(commentFound){
        res.status(204).json({
            message: "Comment Deleted!"
        })
    }
    else{
        res.status(400).json({
            message: "Couldn't Delete Comment"
        })
    }
}