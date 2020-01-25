const EventEmitter = require('events'),
	schemas = require('../../../schemas'),
	encryption = require('../../../utils/encryption'),
	transform = require('../../../schemas/transformations');

class ApiFunction extends EventEmitter
{

	process(req, io)
	{
		const data = req.body.data;
		if (!data)
		{
			this.emit("error", "You need to specify the encrypted version data.");
			return;
		}
		try
		{
			const version = JSON.parse(encryption.decrypt(data));
			if (!version || !version.version || !version.fileName || !version.size || !version.hash)
			{
				this.emit("error", "Incorrect version data.");
				return;
			}

			schemas.Version.findOne({ version: version.version }, (err, found) => {
				if (err)
				{
					this.emit("error", err);
					return;
				}

				if (found)
				{
					this.emit("error", "This version already exists in the database.");
					return;
				}

				const entity = new schemas.Version(version);
				entity.save((err, entity) => {
					if (err)
					{
						this.emit("error", err);
						return;
					}

					io.emit("version", new transform.Version(entity));

					this.emit("complete", {
						success: true,
						version: entity.version
					});
				});
			});
		}
		catch (e)
		{
			console.log(e);
			this.emit("error", "There was an error decrypting the version data.");
			return;
		}
	}

}

module.exports = ApiFunction;