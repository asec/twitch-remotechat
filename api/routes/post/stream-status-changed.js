const EventEmitter = require("events"),
	schemas = require("../../../schemas/index"),
	transform = require("../../../schemas/transformations"),
	mongoose = require("mongoose"),
	TwitchApi = require("../../../twitch/api");

class ApiFunction extends EventEmitter
{

	process(req, io)
	{
		var data = req.body.data;
		const userId = req.query.userId;

		if (req.twitch_hub && req.twitch_hex !== req.twitch_signature)
		{
			this.emit("error", "This request has an invalid signature.");
			return;
		}

		schemas.Streams.updateMany({ isLive: true, userId }, { isLive: false }, (err, items) => {
			if (err)
			{
				this.emit("error", err);
				return;
			}

			if (!data || !data.length)
			{
				io.emit("stream-status-changed", {
					isLive: false,
					userId
				});

				this.emit("complete", {
					success: true
				});
				return;
			}

			data = data[0];

			if (data.game_id)
			{
				schemas.Games.findOne({ gid: data.game_id }, (err, game) => {
					if (err)
					{
						this.emit("error", err);
						return;
					}

					if (!game)
					{
						TwitchApi.getGame(data.game_id)
							.then((result) => {
								if (!result || !result.data || !result.data.data || !result.data.data[0] || !result.data.data[0].id)
								{
									this.emit("error", "API error: Could not get the game: " + data.game_id);
									return;
								}

								const gameData = {
									gid: result.data.data[0].id,
									name: result.data.data[0].name,
									image: result.data.data[0].box_art_url
								};
								const game = new schemas.Games(gameData);
								game.save((err, game) => {
									if (err)
									{
										this.emit("error", err);
										return;
									}

									let entityData = {
										sid: data.id,
										isLive: true,
										userId: data.user_id,
										userName: data.user_name,
										game: mongoose.Types.ObjectId(game._id),
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

										item.game = game;
										io.emit("stream-status-changed", new transform.Streams(item));
						
										this.emit("complete", {
											success: true
										});
										return;
									});
								});
							})
							.catch((err) => {
								this.emit("error", "API error: Could not get the game: " + data.game_id);
								return;
							});
					}
					else
					{
						let entityData = {
							sid: data.id,
							isLive: true,
							userId: data.user_id,
							userName: data.user_name,
							game: mongoose.Types.ObjectId(game._id),
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

							item.game = game;
							io.emit("stream-status-changed", new transform.Streams(item));
			
							this.emit("complete", {
								success: true
							});
							return;
						});
					}
				});
			}
			else
			{
				let entityData = {
					sid: data.id,
					isLive: true,
					userId: data.user_id,
					userName: data.user_name,
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

					io.emit("stream-status-changed", new transform.Streams(item));
	
					this.emit("complete", {
						success: true
					});
					return;
				});
			}
		});
	}

}

module.exports = ApiFunction;