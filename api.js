const db = require("./utils/db");
	api = require("./api/api-core"),
	loop = require("./loop/loop"),
	bot = require('./bot/bot');

loop.init();
bot.init();
api.init(loop, bot);