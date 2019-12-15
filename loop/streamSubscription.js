const EventEmitter = require("events"),
	schemas = require("../schemas/index"),
	TwitchApi = require("../twitch/api"),
	config = require("../config/config");

class StreamSubscription extends EventEmitter
{

	constructor()
	{
		super();
		this.entity = null;
		this.activeUntil = null;
		this.leaseSeconds = 864000;
	}

	load()
	{
		if (!this.entity)
		{
			schemas.Subscriptions.findOne({ type: "main" }, (err, item) => {
				if (err)
				{
					this.emit("error", err);
					return;
				}

				if (item)
				{
					this.calcActivity(item.updated, item.expiration);
					this.entity = item;
					if (!this.isActive())
					{
						this.renew();
					}
					else
					{
						this.emit("ready");
					}
					return;
				}

				this.renew();
			});
		}
		else
		{
			this.emit("ready");
			return;
		}
	}

	reload()
	{
		schemas.Subscriptions.findOne({ type: "main" }, (err, item) => {
			if (err)
			{
				this.emit("error", err);
				return;
			}

			if (item)
			{
				this.calcActivity(item.updated, item.expiration);
				this.entity = item;
				return;
			}
		});
	}

	calcActivity(dateFrom, seconds)
	{
		this.activeUntil = dateFrom;
		this.activeUntil.setSeconds(this.activeUntil.getSeconds() + seconds);
	}

	isActive()
	{
		return (this.activeUntil.toLocaleString() > (new Date()).toLocaleString());
	}

	renew()
	{
		schemas.Subscriptions.deleteMany({ type: "main" }, (err) => {
			if (err)
			{
				this.emit("error", err);
				return;
			}

			TwitchApi.subscribe(this.leaseSeconds)
				.then((response) => {
					console.log("renewSubscription: called the api");
					let data = {
						type: "main",
						topic: config.twitch.apiUrl + "/streams?user_id=" + config.twitch.userId,
						callback: config.twitch.statusCallback,
						expiration: this.leaseSeconds,
						confirmed: false
					};
					const entity = new schemas.Subscriptions(data);
					entity.save((err, item) => {
						if (err)
						{
							this.emit("error", err);
							return;
						}

						this.calcActivity(item.updated, item.expiration);
						this.entity = item;
						this.emit("ready");
						return;
					});
				})
				.catch((err) => {
					this.emit("error", "There was an error while renewing the subscription!");
					return;
				});
		});
	}

}

module.exports = new StreamSubscription();