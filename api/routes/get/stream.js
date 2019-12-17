const EventEmitter = require("events"),
	schemas = require("../../../schemas/index");

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
				data: {
					id: stream.sid,
					title: stream.title,
					isLive: stream.isLive,
					userId: stream.userId,
					userName: stream.userName,
					game: stream.game ? {
						id: stream.game.gid,
						name: stream.game.name,
						image: stream.game.image
					} : null,
					type: stream.type,
					thumbnail: stream.thumbnail
				}
			});
		});
	}

}

module.exports = ApiFunction;