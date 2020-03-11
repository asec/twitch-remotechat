const EventEmitter = require('events'),
	schemas = require('../schemas/index'),
	TwitchApi = require('../twitch/api'),
	config = require('../config/config'),
	log = require('../utils/log');

class StreamSubscription extends EventEmitter
{

	constructor(userId, leaseSeconds)
	{
		super();
		this.userId = userId;
		this.entity = null;
		this.activeUntil = null;
		this.leaseSeconds = leaseSeconds;
	}

	load()
	{
		if (!this.entity)
		{
			schemas.Subscriptions.findOne({ userId: this.userId }, (err, item) => {
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
		schemas.Subscriptions.findOne({ userId: this.userId }, (err, item) => {
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
		return (this.activeUntil > (new Date()));
	}

	renew()
	{
		schemas.Subscriptions.deleteMany({ userId: this.userId }, (err) => {
			if (err)
			{
				this.emit("error", err);
				return;
			}

			TwitchApi.getUserById(this.userId)
				.then((response) => {
					if (response && response.data && response.data.data.length && response.data.data[0])
					{
						const userData = response.data.data[0];
						TwitchApi.subscribe(this.userId, this.leaseSeconds)
							.then((response) => {
								log.info("renewSubscription #" + this.userId + ": called the api", response);
								let data = {
									userId: this.userId,
									userName: userData.login,
									image: userData.profile_image_url,
									topic: config.twitch.apiUrl + "/streams?user_id=" + this.userId,
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
					}
				})
				.catch((err) => {
					this.emit("error", "The following twitch user does not exist: " + this.userId);
					return;
				});
		});
	}

}

module.exports = StreamSubscription;