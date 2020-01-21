const EventEmitter = require("events"),
	schemas = require("../../../schemas/index");

class ApiFunction extends EventEmitter
{

	process(req, loop)
	{
		const challenge = req.query["hub.challenge"];
		const topic = req.query["hub.topic"];
		const mode = req.query["hub.mode"];

		if (!challenge)
		{
			this.emit("error", {
				success: false,
				error: "Invalid or non-existent challenge token"
			});
		}
		else
		{
			if (mode === "subscribe")
			{
				schemas.Subscriptions.findOne({ topic }, (err, item) => {
					if (err)
					{
						this.emit("error", err);
						return;
					}
	
					if (!item)
					{
						this.emit("error", "There doesn't seem to be a subscription that needed a challenge token.");
						return;
					}
	
					item.expiration = req.query["hub.lease_seconds"];
					item.confirmed = true;
					item.save((err, item) => {
						if (err)
						{
							this.emit("error", err);
							return;
						}
	
						loop.streamSubscription.reload();
						this.emit("complete", challenge);
					});
				});
			}
			else
			{
				this.emit("complete", challenge);
			}
		}
	}

}

module.exports = ApiFunction;