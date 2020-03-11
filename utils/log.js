const schemas = require('../schemas');

module.exports = {

	info: function(action, data = {})
	{
		return this.log("info", action, data);
	},

	warning: function(action, data = {})
	{
		return this.log("warning", action, data);
	},

	error: function(action, data = {})
	{
		return this.log("error", action, data);
	},

	success: function(action, data = {})
	{
		return this.log("success", action, data);
	},

	log: function(type, action, data = {})
	{
		const entity = new schemas.Log({
			type,
			action,
			data
		});
		entity.save((err, item) => {
			if (err)
			{
				console.log(err);
				return;
			}

			return;
		});
	}

};