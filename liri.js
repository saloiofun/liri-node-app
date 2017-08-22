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

		// Log the output into log.txt.
		fs.appendFile("log.txt", "\r\n >>> my-tweets\r\n", 'utf8', function(err) {
			if (err) {
				return console.log(err);
			}
		});

		for (var i = 0; i < tweets.length; i++) {
			var output = 
			"\r\n * Tweet: " + tweets[i].text + 
			"\r\n * Tweet created at: " + tweets[i].created_at + "\r\n";

			console.log(output);

			fs.appendFile("log.txt", output, 'utf8', function(err) {
				if (err) {
					return console.log(err);
				}
			});
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
			var track = response.tracks.items[0];
			var output =
			"\r\n * Artist(s): " + track.artists[0].name + "\r\n" +
			" * Song: " + track.name + "\r\n" +
			" * Preview Link: " + track.preview_url + "\r\n" +
			" * Album: " + track.album.name + "\r\n";

			console.log(output);

			// Log the output into log.txt.
			fs.appendFile("log.txt", "\r\n >>> spotify-this-song " + music + "\r\n" + output, function(err) {
				if (err) {
					return console.log(err);
				}
			});

		} else {
			console.log("\n * Track not found!")
			// Log the output into log.txt.
			fs.appendFile("log.txt", "\r\n >>> spotify-this-song " + music + "\r\n * Track not found!", function(err) {
				if (err) {
					return console.log(err);
				}
			});
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
			var output = 
			"\r\n * Title of the movie: " + JSON.parse(body).Title + "\r\n" +
			" * Year the movie came out: " + JSON.parse(body).Year + "\r\n" +
			" * IMDB Rating of the movie: " + JSON.parse(body).imdbRating + "\r\n" +
			" * Rotten Tomatoes Rating of the movie: " + JSON.parse(body).Ratings[1].Value + "\r\n" +
			" * Country where the movie was produced: " + JSON.parse(body).Country + "\r\n" +
			" * Language of the movie: " + JSON.parse(body).Language + "\r\n" +
			" * Plot of the movie: " + JSON.parse(body).Plot + "\r\n" +
			" * Actors in the movie: " + JSON.parse(body).Actors + "\r\n";

			console.log(output);

			// Log the output into log.txt.
			fs.appendFile("log.txt", "\r\n >>> movie-this " + movie + "\r\n" + output, function(err) {
				if (err) {
					return console.log(err);
				}
			});
		} else {
			console.log(" * Movie not found!");
			// Log the output into log.txt.
			fs.appendFile("log.txt", "\r\n >>> movie-this " + movie + "\r\n * Movie not found!", function(err) {
				if (err) {
					return console.log(err);
				}
			});
		}
	});
}

// Get request from text file
var file = function() {
	fs.readFile("random.txt", "utf8", function(err, data) {
		if (err) {
			return console.log(err);
		}
		// Log the output into log.txt.
		fs.appendFile("log.txt", "\r\n >>> do-what-it-says", function(err) {
			if (err) {
				return console.log(err);
			}
		});
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






