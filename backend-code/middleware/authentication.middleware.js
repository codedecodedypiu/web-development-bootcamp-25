const {kshitij} = require('../model/db');

exports.authenticationMiddleware = (req, res, next)=>{
    console.log('I m Middleware')
    const username = req.headers.username;
    const password = req.headers.password;
    if(username === kshitij.username && password === kshitij.password){
        next();
    }else{
        res.status(400).json({
            message: 'Incorrect Credentials!'
        })
    }
}