const EventEmitter = require("events"),
	schemas = require("../../../schemas"),
	transform = require("../../../schemas/transformations");

class ApiFunction extends EventEmitter
{
	
	process(req)
	{
		const userId = req.query.user;
		const streamId = req.query.stream;

		if (!userId)
		{
			this.emit("error", "Please specify a user.");
			return;
		}

		const filter = {
			userId: userId
		};
		if (streamId)
		{
			filter["_id"] = streamId;
		}

		schemas.Streams.findOne(filter).sort({ _id: -1 }).exec((err, stream) => {
			if (err)
			{
				this.emit("error", err);
				return;
			}

			if (!stream)
			{
				schemas.Subscriptions.findOne({ userId }, (err, subscription) => {
					if (err)
					{
						this.emit("error", err);
						return;
					}

					if (!subscription || !subscription._id)
					{
						this.emit("error", "There is no subscription with that id: " + userId);
						return;
					}

					schemas.Chats.find({ channel: '#' + subscription.userName, stream: null }).sort({ _id: -1 }).exec((err, items) => {
						if (err)
						{
							this.emit("error", err);
							return;
						}

						const data = [];
						for (let i = 0; i < items.length; i++)
						{
							data.push(new transform.Chats(items[i]));
						}

						this.emit("complete", {
							success: true,
							data: data
						});
					});
				});
				return;
			}

			schemas.Chats.find({ stream: stream._id }, (err, items) => {
				if (err)
				{
					this.emit("error", err);
					return;
				}

				let data = [];
				for (let i = 0; i < items.length; i++)
				{
					data.push(new transform.Chats(items[i]));
				}
				this.emit("complete", {
					success: true,
					data: data
				});
			});
		});
	}

}

module.exports = ApiFunction;