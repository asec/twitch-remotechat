const express = require("express"),
	cors = require("cors"),
	bodyParser = require("body-parser"),
	config = require("../config/config"),
	routes = require("./routes/index");

module.exports = {

	app: express(),

	init: function()
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
			route.on("complete", (message) => {
				res.json(message);
			});
			route.process(req);
		});
	}

};