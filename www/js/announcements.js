var Announcements = (function() {
	var Announcement = function(key, appName, username) {
		this.key = key;
		this.appName = appName;
		this.username = username;

		this.headers = {
			'User-Agent': appName,
			'Authorization': 'Bearer '+key,
			'Accept-Encoding': 'gzip'
		};
	}

	var lastTweet = null;

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

			var announcement = new CustomEvent('announcement', {detail: newTweets});
			document.dispatchEvent(announcement);
		}

		lastTweet = data[0];
	};

	var reqError = function(jqXHR, textStatus, errorThrown) {
		var error = new CustomEvent('announcement_error', {detail: 'Error updating feed.'});
		document.dispatchEvent(error);
	};

	Announcement.prototype.init = function(minutes) {
		window.setInterval(this.update, 60000*minutes);
	};

	Announcement.prototype.stop = function() {
		window.clearInterval();
	};

	Announcement.prototype.update = function() {
		var opts = { 
			headers: this.headers,
			data: 'screen_name='+this.username+'&count=30',
			type: 'GET',
			crossDomain: true,
			success: reqSuccess,
			error: reqError
		};

		$.ajax(
			'https://api.twitter.com/1.1/statuses/user_timeline.json',
			opts
		);
	}

	return Announcement;
})();