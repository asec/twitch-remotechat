const EventEmitter = require('events'),
	schemas = require('../schemas/index'),
	TwitchApi = require('../twitch/api'),
	log = require('../utils/log');

class AccessToken extends EventEmitter
{

	constructor()
	{
		super();
		this.entity = null;
		this.activeUntil = null;
	}

	load()
	{
		if (!this.entity)
		{
			schemas.AccessToken.findOne((err, item) => {
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
		schemas.AccessToken.deleteMany({}, (err) => {
			if (err)
			{
				this.emit("error", err);
				return;
			}

			TwitchApi.getAccessToken()
				.then((response) => {
					log.info("renewAccessToken: called the api", response);
					if (!response.data || !response.data.access_token)
					{
						this.emit("error", "There was an error getting the access token!");
						return;
					}
					let data = {
						token: response.data.access_token,
						expiration: response.data.expires_in
					};
					const entity = new schemas.AccessToken(data);
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
					this.emit("error", "There was an error getting the access token!");
					return;
				});
		});
	}

	get()
	{
		if (!this.entity || !this.entity.token)
		{
			return "";
		}

		return this.entity.token;
	}

}

module.exports = new AccessToken();