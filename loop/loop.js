const config = require("../config/config"),
	at = require("./accessToken"),
	ss = require("./streamSubscription");

class Loop
{

	accessToken;
	streamSubscription;
	interval;
	initialized = false;

	init()
	{
		this.accessToken = at;
		this.streamSubscription = ss;

		this.accessToken.on("error", (err) => {
			console.error(err);
		});
		this.accessToken.on("ready", () => {
			console.log(this.accessToken.get());
			if (!this.initialized)
			{
				this.streamSubscription.load();
			}
			else
			{
				this.start();
			}
		});
		this.streamSubscription.on("error", (err) => {
			console.error(err);
		});
		this.streamSubscription.on("ready", () => {
			this.initialized = true;
			this.start();
		});
		this.accessToken.load();
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