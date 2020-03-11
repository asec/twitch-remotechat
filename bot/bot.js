const tmi = require('tmi.js'),
	config = require('../config/config'),
	schemas = require('../schemas'),
	axios = require('axios');

module.exports = {

	bot: null,
	channels: {},

	init: function()
	{
		schemas.Subscriptions.find({}, (err, items) => {
			if (err)
			{
				console.error(err);
				return;
			}

			for (let i = 0; i < items.length; i++)
			{
				this.channels[items[i].userName] = items[i].userId;
			}

			this.bot = new tmi.Client({
				connection: {
					reconnect: true,
					secure: true
				},
				identity: {
					username: config.twitchBot.username,
					password: config.twitchBot.password
				},
				channels: Object.keys(this.channels)
			});

			this.bot.on("connected", (addr, port) => {
				console.log(`Twitchbot: Connected to ${addr}:${port}`);
			});

			this.bot.on("message", (target, context, message, self) => {
				if (self)
				{
					return;
				}

				if (message.toLowerCase() === "!ping")
				{
					this.bot.say(target, `${ (new Date()).toLocaleString() }: Pong`);
				}
				else if (message.toLowerCase() === "!channels")
				{
					this.bot.say(target, `Channels: ${ this.bot.getChannels() }`);
				}

				const username = target.substring(1);
				if (!this.channels[username])
				{
					console.error("The following user could not be found: " + username + ". The bot must be lost.");
					return;
				}

				axios.put(config.api.url + ":" + config.api.port + "/chat", {
					user: this.channels[username],
					channel: target,
					context,
					message
				})
				.then((response) => {
					if (!response.data.success)
					{
						console.warn(response.data.error);
						return;
					}
				})
				.catch((err) => {
					console.error(err);
				});
			});

			this.bot.connect();
		});
	},

	join: function(channel, userId)
	{
		if (this.channels[channel])
		{
			console.warn("Twitchbot: The bot should already be in this channel", channel);
			return;
		}
		this.channels[channel] = userId;
		this.bot.join(channel)
			.then((data) => {
				console.log("Twitchbot: Joined the following channel(s)", data);
			})
			.catch((err) => {
				console.error(err);
			});
	},

	part: function(channel)
	{
		this.bot.part(channel)
			.then((data) => {
				this.channels[channel] = null;
				console.log("Twitchbot: Left the following channel(s)", data);
			})
			.catch((err) => {
				console.error(err);
			});
	}

};