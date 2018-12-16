//Below code will get configuration information from .env file
require("dotenv").config();
//module to read file from random.txt
var fs = require("fs");
var keys = require('./keys');
var Spotify = require('node-spotify-api');
//added to format table 
var cTable = require('console.table');
//module to make request
var request = require('request');
//module for date
var moment = require('moment');



var spotify = new Spotify({
    id: keys.spotify.id,
    secret: keys.spotify.secret
});
//Output required information
// Name of the venue
// Venue location
// Date of the Event (use moment to format this as "MM/DD/YYYY")  

//  argument 3 = concert-this or spotify-this-song or movie-this or do-what-it-says
if (process.argv[2] == 'concert-this') {

    var artist = process.argv.slice(3).join(" ")
    // console.log(artist);

    var queryURL = "https://rest.bandsintown.com/artists/" + artist + "/events?app_id=dffc52a8a4eb7aba919d7920e96d7b94";

    request(queryURL, function (error, response, body) {
        if (error) console.log(error);
        var result = JSON.parse(body)[0];
        console.log("##################################################################");
        console.log("Using BandsofTown API ");
        console.log("Venue name:" + result.venue.name);
        console.log("Venue location: " + result.venue.city);
        console.log("Date of Event: " + moment(result.datetime).format("MM/DD/YYYY"));
        console.log("##################################################################");

        //add txt file 
        fs.appendFile('log.txt', result.venue.name + result.venue.city + moment(result.datetime).format("MM/DD/YYYY"),(err) => {
            if (err) throw err;
            console.log('The "data to append" was appended to file!');
        });
            
    });

} else if (process.argv[2] == 'spotify-this-song') {

    var songName = process.argv.slice(3).join(" ");
    if (songName == undefined) {
        songName = "Song is not defined";
    }
    spotify.search({ type: 'track', query: songName, limit: 10 }, function (err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        }
        var tableArray = [];
        for (var i = 0; i < data.tracks.items.length; i++) {
            var result = {
                artist: data.tracks.items[i].album.artists[0].name,
                song_name: data.tracks.items[i].name,
                album_name: data.tracks.items[i].album.name,
                preview_url: data.tracks.items[i].preview_url

                
            }
            tableArray.push(result);
        }
        var table = cTable.getTable(tableArray);
        console.log(table);


    });

} else if (process.argv[2] == 'movie-this') {
    var movieName = process.argv.slice(3).join(" ");

    if (movieName == undefined) {
        movieName = "Movie is undefined err";
    }

    request('http://www.omdbapi.com/?i=tt3896198&apikey=55e8eecb&t=' + process.argv[3], function (error, response, body) {

        var result = JSON.parse(body);
        console.log("Title :" + result.Title);
        console.log("Year :" + result.Released);
        console.log("IMDB Rating :" + result.imdbRating);
        console.log("Rotten Tomatoes :" + result.Ratings[1].Value);
        console.log("Country :" + result.Country);
        console.log("Language :" + result.Language);
        console.log("Movie Plot :" + result.Plot);
        console.log("Actors :" + result.Actors);

    });

} else if (process.argv[2] == 'do-what-it-says') {
    readSpotifyTxtFile();
}

function readSpotifyTxtFile() {
    fs.readFile('random.txt',"utf8", (err, data) => {
        if (err) {
            console.error(err)
            return
        }
        console.log(data)
    })
}