require("dotenv").config();

var axios = require("axios");
var keys = require("./keys.js");
var Spotify = require('node-spotify-api');
var fs = require("fs");
var spotify = new Spotify(keys.spotify);
var moment = require("moment");
var action = process.argv[2];
var allArgs = process.argv;
var searchResult = "";
var artist = "";
var showData = [];

switch (action) {
	case "movie-this":
		movieSearch();
		break;
	case "concert-this":
		bandSearch();
		break;
	case "spotify-this-song":
		spotifySearch();
		break;
	case "do-what-it-says":
		doWhatItSays();
		break;
}

function bandSearch() {
	for (var i = 3; i < allArgs.length; i++) {
		searchResult += allArgs[i]
		artist += (allArgs[i] + " ");
	}

	artist = artist.slice(0, -1);

	var queryUrl = "https://rest.bandsintown.com/artists/" + searchResult + "/events?app_id=codingbootcamp";

	if (searchResult === "") {
		console.log("Please enter a band or artist");
	} else {
		axios.get(queryUrl).then(
			function (response) {
				data = response.data;
				dataLength = response.data.length;

				if (dataLength > 0) {
					for (var j = 0; j < dataLength; j++) {

						console.log("================");
						console.log("Venue name: " + data[j].venue.name);

						if (data[j].venue.region === "") {
							console.log("Location of show:  " + data[j].venue.city + ", " + data[j].venue.country);
							venue = data[j].venue.city + ", " + data[j].venue.country
						} else {
							venue = data[j].venue.city + ", " + data[j].venue.region + ", " + data[j].venue.country;
							console.log("Location of show:  " + data[j].venue.city + ", " + data[j].venue.region + ", " + data[j].venue.country);
						}

						date = new Date(data[j].datetime);

						var momentObj = moment(date);
						var momentString = momentObj.format('MM/DD/YYYY');

						console.log("Date of show: ", momentString);

						showData = [
							"Venue name: " + data[j].venue.name,
							"Location of show: " + venue,
							"Date of show: " + momentString
						].join("\n\n");

						fs.appendFile("log.txt", showData + "\n==========================\n", function (err) {
							if (err) {
								return console.log(err);
							}
						});
					}
					console.log("log.txt was updated!");
				} else {
					console.log(artist + "doesn't have any upcoming shows. Go buy there album.");
				}
			}).catch(function (error) {
				if (error.response) {
					console.log("error alert");
					// The request was made but an error was returned					
					console.log(error.response.data);
					console.log(error.response.status);
					console.log(error.response.headers);
				} else if (error.request) {
					// The request was made but no response was returned
					console.log(error.request);
				} else {
					// Something in the request setup failed
					console.log("Error", error.message);
				}
				console.log(error.config);
			}
			);
	}
}

function omdbResults(url) {
	axios.get(url).then(
		function (response) {
			data = response.data
			if (data.Response === "True") {
				console.log("Release year: ", data.Year);
				console.log("Movie title: ", data.Title);
				console.log("Imdb rating: ", data.imdbRating);
				console.log("Country released: ", data.Country);
				if (data.Ratings.length > 1) {
					console.log("Rotten tomatoes rating: ", data.Ratings[1].Value);
					var rottenRating = data.Ratings[1].Value;
				} else {
					console.log("Only IMDB Rating is available: ", data.Ratings[0].Value);
					rottenRating = data.Ratings[0].Value;
				}
				console.log("Language: ", data.Language);
				console.log("Plot: ", data.Plot);
				console.log("Actors: ", data.Actors);
			} else {
				console.log(data.Error);
			}

			showData = [
				"Release year: " + data.Year,
				"Movie title: " + data.Title,
				"Imdb rating: " + data.imdbRating,
				"Rotten Tomatoes rating: " + rottenRating,
				"Country released: " + data.Country,
				"Language: " + data.Language,
				"Plot: " + data.Plot,
				"Actors: " + data.Actors
			].join("\n\n");

			fs.appendFile("log.txt", showData + "\n==========================\n", function (err) {
				if (err) {
					return console.log(err);
				}
				console.log("log.txt was updated!");
			});
		}
	)
};

function spotifySearch() {
	for (var i = 3; i < allArgs.length; i++) {
		searchResult += (allArgs[i] + " ");
	}

	searchResult = searchResult.slice(0, -1);

	if (searchResult === "") {
		spotify.search({ type: 'track', query: 'The Sign' }, function (err, data) {
			if (err) {
				return console.log('Error occurred: ' + err);
			}

			console.log("By the artist:", data.tracks.items[9].album.artists[0].name);
			console.log("Off the album:", data.tracks.items[9].album.name);
			console.log("Song title:", data.tracks.items[9].name);
			console.log("Listen a preview: ", data.tracks.items[9].preview_url);

			showData = [
				"By the artist:: " + data.tracks.items[9].album.artists[0].name,
				"Off the album: " + data.tracks.items[9].album.name,
				"Song title: " + data.tracks.items[9].name,
				"Listen a preview: " + data.tracks.items[9].preview_url
			].join("\n\n");

			fs.appendFile("log.txt", showData + "\n==========================\n" , function (err) {
				if (err) {
					return console.log(err);
				}
				console.log("log.txt was updated!");
			});
		})
	} else {
		spotify.search({ type: 'track', query: searchResult }, function (err, data) {
			if (err) {
				return console.log('Error occurred:  ' + err);
			}

			var songData = data.tracks.items;
			var songLength = data.tracks.items.length;

			if (songLength > 0) {
				for (var j = 0; j < songLength; j++) {
					console.log("=====================");
					console.log("Song title:", songData[j].name);
					console.log("By the artist:", songData[j].album.artists[0].name);
					console.log("Off the album:", songData[j].album.name);
					if (songData[j].preview_url === null) {
						console.log("There's no preview, but you can listen to it on Spotify: ", songData[j].album.external_urls.spotify);
						var preview = songData[j].album.external_urls.spotify;
					} else {
						console.log("Hear a preview: ", songData[j].preview_url);
						preview = songData[j].preview_url;
					}

					showData = [
						"By the artist: " + data.tracks.items[j].album.artists[0].name,
						"Off the album: " + data.tracks.items[j].album.name,
						"Song title:: " + data.tracks.items[j].name,
						"Listen a preview: " + preview
					].join("\n\n");

					fs.appendFile("log.txt", showData + "\n==========================\n", function (err) {
						if (err) {
							return console.log(err);
						}
					});
				}
				console.log("log.txt was updated!");
			} else {
				console.log("We can't find the song you're looking for", searchResult);
			}
		});
	}
};

function movieSearch() {
	for (var i = 3; i < allArgs.length; i++) {
		searchResult += (allArgs[i] + "+");
	}

	searchResult = searchResult.slice(0, -1);

	var queryUrl = "http://www.omdbapi.com/?t=" + searchResult + "&y=&plot=short&apikey=trilogy";
	var nobodyUrl = "http://www.omdbapi.com/?t=mr+nobody&y=&plot=short&apikey=trilogy";

	if (searchResult === "") {
		omdbResults(nobodyUrl);
	} else {
		omdbResults(queryUrl);
	}
}

function doWhatItSays() {
	fs.readFile("random.txt", "utf8", function (error, data) {
		if (error) {
			return console.log(error);
		}
		console.log(data);

		var dataArr = data.split(",");
		console.log(dataArr);

		action = dataArr[0];
		searchResult = dataArr[1];

		switch (action) {
			case "movie-this":
				movieSearch();
				break;
			case "concert-this":
				bandSearch();
				break;
			case "spotify-this-song":
				spotifySearch();
				break;
			case "do-what-it-says":
				doWhatItSays();
				break;
		}
	});
}