const EventEmitter = require("events"),
	schemas = require("../../../schemas/index"),
	transform = require("../../../schemas/transformations");

class ApiFunction extends EventEmitter
{

	process(req)
	{
		const userId = req.query.user;
		const latest = (req.query.latest || "true") === "true";

		if (!userId)
		{
			this.emit("error", "Please specify a user.");
			return;
		}

		if (latest)
		{
			schemas.Streams.findOne({ userId: userId }).populate("game").sort({ updated: -1 }).exec((err, stream) => {
				if (err)
				{
					this.emit("error", err);
					return;
				}
	
				if (!stream)
				{
					this.emit("complete", {
						success: true,
						data: []
					});
					return;
				}
	
				this.emit("complete", {
					success: true,
					data: [new transform.Streams(stream)]
				});
			});
		}
		else
		{
			schemas.Streams.find({ userId: userId }).populate("game").sort({ updated: -1 }).exec((err, items) => {
				if (err)
				{
					this.emit("error", err);
					return;
				}
	
				if (!items || !items.length)
				{
					this.emit("complete", {
						success: true,
						data: []
					});
					return;
				}
	
				const data = [];
				for (let i = 0; i < items.length; i++)
				{
					data.push(new transform.Streams(items[i]));
				}
				this.emit("complete", {
					success: true,
					data: data
				});
			});
		}
	}

}

module.exports = ApiFunction;