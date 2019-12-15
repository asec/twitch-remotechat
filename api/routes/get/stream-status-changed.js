const EventEmitter = require("events");

class ApiFunction extends EventEmitter
{

	process(req)
	{
		console.log(req.params);
		console.log(req.query);
		console.log(req.body);
		console.log("-------------------");

		this.emit("complete", {
			success: true
		});
	}

}

module.exports = ApiFunction;