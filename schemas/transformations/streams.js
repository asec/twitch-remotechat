const schemas = require("../index"),
	SchemaTransformationsGames = require("./games");

class SchemaTransformationsStreams
{

	constructor(entity)
	{
		let game = null;
		if (entity.game)
		{
			if (entity.game instanceof schemas.Games)
			{
				game = new SchemaTransformationsGames(entity.game);
			}
			else
			{
				game = entity.game;
			}
		}
		const translate = {
			id: entity._id,
			sid: entity.sid,
			title: entity.title,
			isLive: entity.isLive,
			userId: entity.userId,
			userName: entity.userName,
			game: game,
			type: entity.type,
			thumbnail: entity.thumbnail
		};

		for (let i in translate)
		{
			this[i] = translate[i];
		}
	}

}

module.exports = SchemaTransformationsStreams;