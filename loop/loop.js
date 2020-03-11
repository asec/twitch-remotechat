const config = require('../config/config'),
	at = require('./accessToken'),
	ss = require('./streamSubscriptionManager'),
	log = require('../utils/log');

class Loop
{

	constructor()
	{
		this.accessToken = null;
		this.streamSubscription = null;
		this.interval = null;
		this.initialized = false;
	}

	init()
	{
		this.accessToken = at;
		this.streamSubscription = ss;

		this.accessToken.on("error", (err) => {
			log.error("Loop.init: renewing access token", err);
		});
		this.accessToken.on("ready", () => {
			log.success(`Loop.init: got access token ${this.accessToken.get()}`);
			if (!this.initialized)
			{
				this.streamSubscription.load(this.accessToken.get());
			}
			else
			{
				this.start();
			}
		});
		this.streamSubscription.on("error", (err) => {
			log.error("Loop.init: renewing subscriptions", err);
		});
		this.streamSubscription.on("ready", () => {
			this.initialized = true;
			this.start();
		});
		this.accessToken.load();
	}

	add(userId)
	{
		this.stop();
		this.streamSubscription.add(userId);
	}

	start()
	{
		if (this.interval)
		{
			this.stop();
		}
		this.interval = setInterval(() => {
			this.tick();
		}, config.renewer.tickrate);
	}

	stop()
	{
		clearTimeout(this.interval);
		this.interval = null;
	}

	tick()
	{
		if (!this.accessToken.isActive())
		{
			this.stop();
			this.accessToken.renew();
		}
		if (!this.streamSubscription.isActive())
		{
			this.stop();
			this.streamSubscription.renew();
		}
	}

}

module.exports = new Loop();