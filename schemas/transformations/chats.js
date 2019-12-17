class SchemaTransformationChats
{

	constructor(entity)
	{
		const translate = {
			channel: entity.channel,
			context: entity.context,
			message: entity.message
		};

		for (let i in translate)
		{
			this[i] = translate[i];
		}
	}

}

module.exports = SchemaTransformationChats;