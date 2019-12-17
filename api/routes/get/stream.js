const EventEmitter = require("events"),
	schemas = require("../../../schemas/index"),
	transform = require("../../../schemas/transformations");

class ApiFunction extends EventEmitter
{

	process(req)
	{
		schemas.Streams.findOne().populate("game").sort({ updated: -1 }).exec((err, stream) => {
			if (err)
			{
				this.emit("error", err);
				return;
			}

			if (!stream)
			{
				this.emit("complete", {
					success: true,
					data: {}
				});
				return;
			}

			this.emit("complete", {
				success: true,
				data: new transform.Streams(stream)
			});
		});
	}

}

module.exports = ApiFunction;