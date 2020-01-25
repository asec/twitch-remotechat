class SchemaTransformationsVersion
{

	constructor(entity)
	{
		const translate = {
			version: entity.version,
			fileName: entity.fileName,
			size: entity.size,
			hash: entity.hash
		};

		for (let i in translate)
		{
			this[i] = translate[i];
		}
	}

}

module.exports = SchemaTransformationsVersion;