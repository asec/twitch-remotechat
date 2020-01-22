const EventEmitter = require("events"),
	schemas = require("../../../schemas/index"),
	transform = require("../../../schemas/transformations");

class ApiFunction extends EventEmitter
{

	process(req)
	{
		schemas.Subscriptions.find({}).sort({ userName: 1 }).exec((err, items) => {
			if (err)
			{
				this.emit("error", err);
				return;
			}

			const data = [];
			for (let i = 0; i < items.length; i++)
			{
				data.push(new transform.Subscriptions(items[i]));
			}

			const grabStreamState = (item) => {
				return new Promise((resolve, reject) => {
					schemas.Streams.findOne({ userId: item.userId }).sort({ updated: -1 }).exec((err, latest) => {
						if (err)
						{
							reject(err);
						}
						else if (!latest)
						{
							reject("No streams for " + item.userId + " yet.");
						}
						else
						{
							resolve({
								isLive: latest.isLive
							});
						}
					});
				});
			};
			
			const updateWithStreamState = async (items) => {
				for (let i = 0; i < items.length; i++)
				{
					try
					{
						items[i].isLive = (await grabStreamState(items[i])).isLive;
					}
					catch (err)
					{
						items[i].isLive = false;
						//console.log(err);
					}
				}

				return items;
			}

			updateWithStreamState(data).then((data) => {

				this.emit("complete", {
					success: true,
					data: data
				});

			});
		});
	}

}

module.exports = ApiFunction;