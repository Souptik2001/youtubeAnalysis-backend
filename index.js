const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const morgan = require('morgan');
const { response } = require('express');
require('dotenv').config();

const app = express();

app.use(morgan('tiny'));
app.use(cors());

function getVideos(url){
    return new Promise((resolve, reject)=>{
        setTimeout(()=>{
            fetch(`${url}&key=${process.env.API_KEY}`)
            .then(response=> response.json())
            .then(videos => {
                resolve(videos);
            })
            .catch(()=>{
                reject();
            });
        }, 0);
    });
}

app.get('/videos', (req, res)=>{
    if (req.query.channel_ID != undefined && req.query.pageToken==undefined){
        fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet%2CcontentDetails%2Cstatistics&forUsername=${req.query.channel_ID}&key=${process.env.API_KEY}`)
        .then(response=> response.json())
        .then(json=> {
            const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${json.items[0].contentDetails.relatedPlaylists.uploads}&maxResults=50`;
            getVideos(url)
            .then(videos=>{
                videos.PLAYLIST_ID = json.items[0].contentDetails.relatedPlaylists.uploads;
                videos.channeltitle = json.items[0].snippet.localized.title;
                videos.channeldesc = json.items[0].snippet.localized.description;
                videos.channelid = json.items[0].id;
                videos.channelviews = json.items[0].statistics.viewCount;
                if(json.items[0].statistics.hiddenSubscriberCount==false){
                    videos.channelsubs = json.items[0].statistics.subscriberCount;
                }else{
                    videos.channelsubs = "Hidden";
                }
                videos.channelvideos = json.items[0].statistics.videoCount;
                res.json(videos);
            })
            .catch(()=>{
                res.json({
                    error: "Some problem in fetching videos...😕"
                });
            });
        })
        .catch(()=>{
            res.json({
                error: "Channel Not found... 😕"
            });
        });
    }else{
        const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&pageToken=${req.query.pageToken}&playlistId=${req.query.PLAYLIST_ID}&maxResults=50`;
        getVideos(url)
        .then(videos=>{
            res.json(videos);
        })
        .catch(()=>{
            res.json({
                error: "Some problem in fetching videos...😕"
            });
        }); 
    }
    // if (req.query.pageToken==undefined){
    //     const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${process.env.PLAYLIST_ID}&maxResults=50`;
    // }else{
    //     const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&pageToken=${req.query.pageToken}&playlistId=${process.env.PLAYLIST_ID}&maxResults=50`;
    // }
    // fetch(`${url}&key=${process.env.API_KEY}`)
    // .then(response=> response.json())
    // .then(json => {
    //     res.json(json);
    // });
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