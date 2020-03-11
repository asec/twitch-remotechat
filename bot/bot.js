const tmi = require('tmi.js'),
	config = require('../config/config'),
	schemas = require('../schemas'),
	axios = require('axios'),
	log = require('../utils/log');

module.exports = {

	bot: null,
	channels: {},

	init: function()
	{
		schemas.Subscriptions.find({}, (err, items) => {
			if (err)
			{
				log.error("Twitchbot.init, getting subscriptions", err);
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
				log.success(`Twitchbot: Connected to ${addr}:${port}`);
			});

			this.bot.on("disconnected", (reason) => {
				log.error(`Disconnected: ${reason}`);
			});

			this.bot.on("message", (target, context, message, self) => {
				if (self)
				{
					return;
				}

				/*if (message.toLowerCase() === "!twt-ping")
				{
					this.bot.say(target, `${ (new Date()).toLocaleString() }: Pong`);
					return;
				}
				else if (message.toLowerCase() === "!twt-channels")
				{
					this.bot.say(target, `Channels: ${ this.bot.getChannels() }`);
					return;
				}*/

				const username = target.substring(1);
				if (!this.channels[username])
				{
					log.error("The following user could not be found: " + username + ". The bot must be lost.");
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
						log.warning(response.data.error)
						return;
					}
				})
				.catch((err) => {
					log.error("Twitchbot on message, sending with axios", err);
				});
			});

			this.bot.connect();
		});
	},

	join: function(channel, userId)
	{
		if (this.channels[channel])
		{
			log.warning(`Twitchbot: The bot should already be in this channel: ${channel}`);
			return;
		}
		this.channels[channel] = userId;
		this.bot.join(channel)
			.then((data) => {
				log.info("Twitchbot: Joined the following channel(s)", data);
			})
			.catch((err) => {
				log.error("Twitchbot join failed", err);
			});
	},

	part: function(channel)
	{
		this.bot.part(channel)
			.then((data) => {
				this.channels[channel] = null;
				log.info("Twitchbot: Left the following channel(s)", data);
			})
			.catch((err) => {
				log.error("Twitchbot part failed", err);
			});
	}

};