const EventEmitter = require("events"),
	schemas = require("../../../schemas");

class ApiFunction extends EventEmitter
{

	process(req, loop, bot)
	{
		const id = req.params.id;

		schemas.Subscriptions.findOne({ userId: id }, (err, subscription) => {
			if (err)
			{
				this.emit("error", err);
				return;
			}

			if (!subscription || !subscription.userId)
			{
				this.emit("error", "The following subscription does not exists: " + id);
				return;
			}

			schemas.Subscriptions.deleteOne({ userId: id }, (err) => {
				if (err)
				{
					this.emit("error", err);
					return;
				}

				loop.streamSubscription.delete(id);
				bot.part(subscription.userName);

				this.emit("complete", {
					success: true,
					id: id
				});
			});
		});
	}

}

module.exports = ApiFunction;