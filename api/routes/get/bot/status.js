const EventEmitter = require('events');

class ApiFunction extends EventEmitter
{

	process(req, bot)
	{
		const options = bot.bot.getOptions();
		options.identity.password = "";
		this.emit("complete", {
			success: true,
			options,
			readyState: bot.bot.readyState(),
			channels: bot.bot.getChannels()
		});
		return;
	}

}

module.exports = ApiFunction;