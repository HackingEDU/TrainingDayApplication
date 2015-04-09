var Announcements = (function() {
	var Announcement = function(key, appName, username) {
		this.key = key;
		this.appName = appName;
		this.username = username;

		this.headers = {
			'User-Agent': appName,
			'Accept-Encoding': 'gzip',
			'Authorization': 'Bearer '+key
		};
	}

	var lastTweet = null;

	//announcement event is fired when a new tweet is posted
	var reqSuccess = function(data) {
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

		if (lastTweet === null) {
			var announcement = new CustomEvent('announcement', {detail: data});
			document.dispatchEvent(announcement);
		}

		lastTweet = data[0];
	};

	var reqError = function(jqXHR, textStatus, errorThrown) {
		var error = new CustomEvent('announcement_error', {detail: {
			response: jqXHR.responseText,
			text: textStatus,
			error: errorThrown
		}});
		document.dispatchEvent(error);
	};

	Announcement.prototype.init = function(minutes) {
		this.update();
		
		var that = this;
		window.setInterval(function() {
			that.update();
		}, 60000*minutes);
	};

	Announcement.prototype.stop = function() {
		window.clearInterval();
	};

	Announcement.prototype.update = function() {
		var opts = { 
			headers: this.headers,
			data: 'screen_name='+this.username+'&count=30',
			method: 'GET',
			dataType: 'json',
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