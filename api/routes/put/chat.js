const EventEmitter = require("events"),
	schemas = require("../../../schemas/index"),
	mongoose = require("mongoose"),
	transform = require("../../../schemas/transformations");

class ApiFunction extends EventEmitter
{

	process(req, io)
	{
		schemas.Streams.findOne().sort({ updated: -1 }).exec((err, stream) => {
			if (err)
			{
				this.emit("error", err);
				return;
			}

			let data = {
				channel: req.body.channel,
				context: req.body.context,
				message: req.body.message
			};
			if (stream)
			{
				data.stream = mongoose.Types.ObjectId(stream._id);
			}

			const chat = new schemas.Chats(data);
			chat.save((err, chat) => {
				if (err)
				{
					this.emit("error", err);
					return;
				}

				io.emit("chat", new transform.Chats(chat));

				this.emit("complete", {
					success: true,
					id: chat._id
				});
			});
		});
	}

}

module.exports = ApiFunction;