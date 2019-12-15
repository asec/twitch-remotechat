const db = require("./utils/db");
	api = require("./api/api-core"),
	schemas = require("./schemas/index");

schemas.Subscriptions.findOne({ type: "main" }, (err, item) => {
	if (err)
	{
		console.error(err);
		return;
	}

	console.log(item);
});

api.init();