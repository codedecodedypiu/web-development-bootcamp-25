const express = require('express')

const watchRouter = require('./routes/watch.routes')

const app = express();
const PORT = 3000;

const { kshitij, kshitijSubscriptions, videos } = require('./model/db')


app.use(express.json());

app.use('/watch', watchRouter)


app.get('/', (req, res)=>{
    res.status(200).json({
            username: kshitij.username,
            channelId: kshitij.channelId,
            subscriptions: kshitijSubscriptions
        })
})


app.listen(PORT, ()=>{
    console.log(`Server running on PORT: ${PORT}`)
})