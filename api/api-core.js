const express = require("express"),
	cors = require("cors"),
	bodyParser = require("body-parser"),
	config = require("../config/config"),
	routes = require("./routes/index");

module.exports = {

	app: express(),

	init: function(loop)
	{
		this.app.use(cors());
		this.app.use(bodyParser.json());
		this.app.use(bodyParser.urlencoded({ extended: true }));

		this.app.listen(config.api.port, () => {
			console.info("Server started on " + config.api.port);
		});

		this.app.get("/", (req, res) => {
			res.json({
				success: true
			});
		});

		this.app.get("/stream-status-changed", (req, res) => {
			const route = new routes.get.streamStatusChanged();
			route.on("error", (message) => {
				res.status(400).json(message);
			});
			route.on("complete", (message) => {
				res.send(message);
			});
			route.process(req, loop);
		});

		this.app.post("/stream-status-changed", (req, res) => {
			const route = new routes.post.streamStatusChanged();
			route.on("error", (message) => {
				res.json({
					success: false,
					error: message
				});
			});
			route.on("complete", (message) => {
				res.json(message);
			});
			route.process(req);
		});
	}

};