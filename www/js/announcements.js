var Announcements = (function() {
	//load api key before use
	var KEY = '';
	var SCREEN_NAME = 'hackingedusf';
	var HEADERS = {
		'User-Agent': 'HackingEDU Training Day',
		'Authorization': 'Bearer '+KEY,
		'Accept-Encoding': 'gzip'
	};

	var lastTweet = null;

	var pollTwitter = function() {
		var opts = { 
			headers: HEADERS,
			data: 'screen_name='+SCREEN_NAME+'&count=30',
			type: 'GET',
			success: reqSuccess,
			error: reqError
		};

		$.ajax(
			'https://api.twitter.com/1.1/statuses/user_timeline.json',
			opts
		);
	};

	//announcement event is fired when a new tweet is posted
	var reqSuccess = function(data, textStatus, jqXHR) {
		if (lastTweet !== null && lastTweet.id !== data[0].id) {
			var newTweets = [];
			var tweet = data[0];
			var count = 0;
			while (tweet.id !== lastTweet.id && count < data.length) {
				newTweets.push(tweet);
				count++;
				tweet = data[count];
			}

			var announcement = new CustomEvent('annoucement', {detail: newTweets});
			document.dispatchEvent(announcement);
		}

		lastTweet = data[0];
	};

	var reqError = function(jqXHR, textStatus, errorThrown) {
		//gotta let the user know request failed somehow
	};

	return {
		init: function() {
			window.setInterval(pollTwitter, 60000);
		},

		stop: function() {
			window.clearInterval();
		},

		update: function() {
			pollTwitter();
		}
	};
}());