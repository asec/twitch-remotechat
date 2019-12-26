const EventEmitter = require("events"),
	schemas = require("../../../schemas/index"),
	transform = require("../../../schemas/transformations");

class ApiFunction extends EventEmitter
{

	process(req)
	{
		schemas.Subscriptions.find({}).sort({ userName: 1 }).exec((err, items) => {
			if (err)
			{
				this.emit("error", err);
				return;
			}

			const data = [];
			for (let i = 0; i < items.length; i++)
			{
				data.push(new transform.Subscriptions(items[i]));
			}
			this.emit("complete", {
				success: true,
				data: data
			});
		});
	}

}

module.exports = ApiFunction;