// Required nodes
var Twitter = require('twitter');
var Spotify = require('node-spotify-api');
var Request = require("request");
var fs = require("fs");

// For User based authentication:
var twitterClient = new Twitter({
	consumer_key: process.env.TWITTER_CONSUMER_KEY,
	consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
	access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
	access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

// For User based authentication:
var spotifyClient = new Spotify({
	id: process.env.SPOTIFY_ID,
	secret: process.env.SPOTIFY_SECRET
});

// Capture user's input
var option = process.argv[2];
var value = [];
var liri;

if (process.argv.length > 3) {
	for (var i = 3; i < process.argv.length; i++) {
		value.push(process.argv[i]);
	}
	liri = value.join("+");
}

// Get tweets
var params = {
	count: 20
};
var twitter = function() {
	twitterClient.get('statuses/user_timeline', params, function(error, tweets, response) {
		if(error) throw error;
		for (var i = 0; i < tweets.length; i++) {
			console.log("\n * Tweet: " + tweets[i].text);
			console.log(" * Tweet created at: " + tweets[i].created_at + "\n");
		}
	});
}

// Get track info
var spotify = function(music) {
	if (!music) {
		music = "The Sign Ace of Base";
	}
	spotifyClient.search({ type: 'track', query: music, limit: 1 })
	.then(function(response) {
		if (response.tracks.items.length) {
			// console.log(JSON.stringify(response, null, 3));
			console.log("\n * Artist(s): " + response.tracks.items[0].artists[0].name);
			console.log(" * Song: " + response.tracks.items[0].name);
			console.log(" * Preview Link: " + response.tracks.items[0].preview_url);
			console.log(" * Album: " + response.tracks.items[0].album.name + "\n");
		} else {
			console.log("\n * Track not found!")
		}
	})
	.catch(function(err) {
		console.log(err);
	});
}

// Get movie
var omdb = function(movie) {
	if (!movie) {
		movie = "Mr.+Nobody";
	}
	var queryUrl = "https://www.omdbapi.com/?t=" + movie + "&y=&plot=short&apikey=" + process.env.OMDB_API_KEY;
	Request(queryUrl, function(error, response, body) {
		if (!error && response.statusCode === 200 && JSON.parse(body).Response === "True") {
			console.log("\n OMDB URL: " + queryUrl + "\n");
			console.log(" * Title of the movie: " + JSON.parse(body).Title);
			console.log(" * Year the movie came out: " + JSON.parse(body).Year);
			console.log(" * IMDB Rating of the movie: " + JSON.parse(body).imdbRating);
			console.log(" * Rotten Tomatoes Rating of the movie: " + JSON.parse(body).Ratings[1].Value);
			console.log(" * Country where the movie was produced: " + JSON.parse(body).Country);
			console.log(" * Language of the movie: " + JSON.parse(body).Language);
			console.log(" * Plot of the movie: " + JSON.parse(body).Plot);
			console.log(" * Actors in the movie: " + JSON.parse(body).Actors);
		} else {
			console.log(" * Movie not found!");
		}
	});
}

// Get request from text file
var file = function() {
	fs.readFile("random.txt", "utf8", function(err, data) {
		if (err) {
			return console.log(err);
		}
		data = data.split(",");
		runLiri(data[0],data[1]);
	});	
}

// Receives option and value to run Liri
function runLiri(option, value) {
	switch (option) {
		case "my-tweets":
		twitter();
		break;
		case "spotify-this-song":
		spotify(value);
		break;
		case "movie-this":
		omdb(value);
		break;
		case "do-what-it-says":
		file();
		break;
		default:
		break;
	}
}

// Run Liri
runLiri(option, liri);






