const db = require("./utils/db");
	api = require("./api/api-core"),
	loop = require("./loop/loop");

loop.init();
api.init(loop);