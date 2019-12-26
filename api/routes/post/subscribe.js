const EventEmitter = require("events"),
	schemas = require("../../../schemas/index"),
	TwitchApi = require("../../../twitch/api"),
	transform = require("../../../schemas/transformations");

class ApiFunction extends EventEmitter
{

	process(req, loop)
	{
		let username = req.body.username;

		schemas.Subscriptions.findOne({ userName: username }, (err, item) => {
			if (err)
			{
				this.emit("error", err);
				return;
			}

			if (item)
			{
				this.emit("error", "You are already subscribed to this streamer.");
				return;
			}

			TwitchApi.getUserByName(username)
				.then((response) => {
					if (response && response.data && response.data.data.length && response.data.data[0])
					{
						schemas.Subscriptions.findOne({ userId: response.data.data[0].id }, (err, item) => {
							if (err)
							{
								this.emit("error", err);
								return;
							}

							if (item)
							{
								this.emit("error", "You are already subscribed to this streamer.");
								return;
							}

							loop.add(response.data.data[0].id);
							this.emit("complete", {
								success: true,
								userId: response.data.data[0].id
							});
							return;
						});
					}

					if (response && response.data && !response.data.data.length)
					{
						this.emit("error", "The following twitch user does not exist: " + username);
						return;
					}
				})
				.catch((err) => {
					this.emit("error", "The following twitch user does not exist: " + username);
					return;
				});
		});
	}

}

module.exports = ApiFunction;