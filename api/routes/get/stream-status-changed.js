const EventEmitter = require("events");

class ApiFunction extends EventEmitter
{

	process(req)
	{
		console.log(req.params);
		console.log("-------------------");
		console.log(req.body);

		this.emit("complete", {
			success: true
		});
	}

}

module.exports = ApiFunction;