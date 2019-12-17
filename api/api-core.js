const express = require("express"),
	httpWrapper = require("http"),
	socketIo = require("socket.io"),
	cors = require("cors"),
	bodyParser = require("body-parser"),
	config = require("../config/config"),
	routes = require("./routes/index");

module.exports = {

	init: function(loop)
	{
		const app = express();
		const http = httpWrapper.createServer(app);
		const io = socketIo(http);
		app.use(cors());
		app.use(bodyParser.json());
		app.use(bodyParser.urlencoded({ extended: true }));

		http.listen(config.api.port, () => {
			console.info("Server started on " + config.api.port);
		});

		io.on("connection", (socket) => {
			console.log("WS: Connected");
		})

		app.get("/", (req, res) => {
			res.json({
				success: true
			});
		});

		app.get("/stream-status-changed", (req, res) => {
			const route = new routes.get.streamStatusChanged();
			route.on("error", (message) => {
				res.status(400).json(message);
			});
			route.on("complete", (message) => {
				res.send(message);
			});
			route.process(req, loop);
		});

		app.post("/stream-status-changed", (req, res) => {
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

		app.put("/chat", (req, res) => {
			const route = new routes.put.chat();
			route.on("error", (message) => {
				res.json({
					success: false,
					error: message
				});
			});
			route.on("complete", (message) => {
				res.json(message);
			});
			route.process(req, io);
		});

		app.get("/stream", (req, res) => {
			const route = new routes.get.stream();
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

		app.get("/chat", (req, res) => {
			const route = new routes.get.chat();
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