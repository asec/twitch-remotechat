const EventEmitter = require("events"),
	schemas = require("../../../schemas"),
	transform = require("../../../schemas/transformations");

class ApiFunction extends EventEmitter
{
	
	process(req)
	{
		schemas.Streams.findOne().sort({ _id: -1 }).exec((err, stream) => {
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