const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const morgan = require('morgan');
const { response } = require('express');
require('dotenv').config();

const app = express();

app.use(morgan('tiny'));
app.use(cors());

app.get('/videos', (req, res)=>{
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${process.env.PLAYLIST_ID}&maxResults=50`;
    fetch(`${url}&key=${process.env.API_KEY}`)
    .then(response=> response.json())
    .then(json => {
        res.json(json.items);
    });
});

function notFound(req, res, next){
    res.status(404);
    const error = new Error("Not found");
    next(error);
}

function errorHandler(error, req, res, next){
    res.status(res.statusCode || 500);
    res.json({
        message : error.message
    });
}

app.use(notFound);
app.use(errorHandler);

app.listen(process.env.PORT || 8000, ()=>{
    console.log("App live on http://localhost:8000");
});