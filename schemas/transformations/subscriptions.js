class SchemaTransformationsSubscriptions
{

	constructor(entity)
	{
		const translate = {
			userId: entity.userId,
			userName: entity.userName,
			image: entity.image,
			confirmed: entity.confirmed
		};

		for (let i in translate)
		{
			this[i] = translate[i];
		}
	}

}

module.exports = SchemaTransformationsSubscriptions;