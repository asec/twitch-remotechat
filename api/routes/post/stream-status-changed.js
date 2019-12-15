const EventEmitter = require("events"),
	schemas = require("../../../schemas/index");

class ApiFunction extends EventEmitter
{

	process(req)
	{
		var headers = req.headers;
		var data = req.body.data;

		schemas.Streams.updateMany({ isLive: true }, { isLive: false }, (err, items) => {
			if (err)
			{
				this.emit("error", err);
				return;
			}

			if (!data || !data.length)
			{
				this.emit("complete", {
					success: true
				});
				return;
			}

			data = data[0];

			let entityData = {
				sid: data.id,
				isLive: true,
				userId: data.user_id,
				userName: data.user_name,
				gameId: data.game_id,
				type: data.type,
				title: data.title,
				thumbnail: data.thumbnail_url
			};
			const entity = new schemas.Streams(entityData);
			entity.save((err, item) => {
				if (err)
				{
					this.emit("error", err);
					return;
				}

				this.emit("complete", {
					success: true
				});
				return;
			});
		});
	}

}

module.exports = ApiFunction;