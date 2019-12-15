const EventEmitter = require("events");

class ApiFunction extends EventEmitter
{

	process(req)
	{
		const challenge = req.query["hub.challenge"];

		if (!challenge)
		{
			this.emit("error", {
				success: false,
				error: "Invalid or non-existent challenge token"
			});
		}
		else
		{
			this.emit("complete", challenge);
		}
	}

}

module.exports = ApiFunction;