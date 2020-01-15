const EventEmitter = require("events"),
	schemas = require("../schemas/index"),
	TwitchApi = require("../twitch/api"),
	StreamSubscription = require("./streamSubscription");

class StreamSubscriptionManager extends EventEmitter
{

	constructor()
	{
		super();
		this.entities = [];
		this.isReady = [];
		this.leaseSeconds = 864000;
	}

	load(accessToken)
	{
		schemas.Subscriptions.find({}, (err, items) => {
			if (err)
			{
				this.emit("error", err);
				return;
			}

			if (!items.length)
			{
				items = [];
				TwitchApi.getWebhookSubscriptions(20, accessToken)
					.then((response) => {
						if (!response || !response.data || !response.data.data.length)
						{
							return;
						}

						const regex = /\/streams\?user\_id\=([a-zA-Z0-9]+)/i;

						for (let i = 0; i < response.data.data.length; i++)
						{
							const match = regex.exec(response.data.data[i].topic);
							if (match && match[1])
							{
								items.push({
									userId: match[1]
								});
							}
						}
						this.loadItems(items);
					})
					.catch((err) => {
						this.emit("error", "There was an error while listing the registered subscriptions on startup!");
						return;
					});
			}
			else
			{
				this.loadItems(items);
			}
		});
	}

	loadItems(items)
	{
		for (let i = 0; i < items.length; i++)
		{
			const entity = new StreamSubscription(items[i].userId, this.leaseSeconds);
			this.entities[i] = entity;
			this.isReady[i] = false;
			entity.on("error", (err) => {
				this.emit("error", err);
				return;
			});
			entity.on("ready", () => {
				this.isReady[i] = true;
				let ready = 0;
				for (let j = 0; j < this.entities.length; j++)
				{
					if (this.isReady[j])
					{
						ready++;
					}
				}
				if (ready === this.entities.length)
				{
					this.emit("ready");
					return;
				}
			});
			entity.load();
		}
	}

	isActive()
	{
		let result = true;
		for (let i = 0; i < this.entities.length; i++)
		{
			if (!this.entities[i].isActive())
			{
				result = false;
				break;
			}
		}

		return result;
	}

	renew()
	{
		for (let i = 0; i < this.entities.length; i++)
		{
			if (!this.entities[i].isActive())
			{
				this.isReady[i] = false;
				this.entities[i].renew();
			}
		}
	}

	add(userId)
	{
		const i = this.entities.length;
		const entity = new StreamSubscription(userId, this.leaseSeconds);
		this.entities[i] = entity;
		this.isReady[i] = false;
		entity.on("error", (err) => {
			this.emit("error", err);
			return;
		});
		entity.on("ready", () => {
			this.isReady[i] = true;
			let ready = 0;
			for (let j = 0; j < this.entities.length; j++)
			{
				if (this.isReady[j])
				{
					ready++;
				}
			}
			if (ready === this.entities.length)
			{
				this.emit("ready");
				return;
			}
		});
		entity.load();
	}

	delete(userId)
	{
		TwitchApi.unsubscribe(userId, this.leaseSeconds)
			.then((response) => {
				this.entities = this.entities.filter(item => item.userId !== userId);
			})
			.catch((err) => {
				this.emit("error", "There was an error while unsubscribing from the following streamer: " + userId);
				return;
			});
	}

}

module.exports = new StreamSubscriptionManager();