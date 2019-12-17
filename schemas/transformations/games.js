class SchemaTransformationsGames
{

	constructor(entity)
	{
		const translate = {
			id: entity.gid,
			name: entity.name,
			image: entity.image
		};

		for (let i in translate)
		{
			this[i] = translate[i];
		}
	}

}

module.exports = SchemaTransformationsGames;