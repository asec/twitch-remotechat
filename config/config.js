const secret = require("./config.secret");

module.exports = {

	api: {
		port: 7332
	},
	renewer: {
		tickrate: 3000
	},
	mongodb: {
		uri: "mongodb://localhost:27017/twitch-remote-chat"
	},
	dbt: {
		SUBSCRIPTIONS: "subscriptions"
	},
	twitch: {
		userId: 475650268,
		clientId: secret.clientId,
		clientSecret: secret.clientSecret,
		url: "https://api.twitch.tv/helix"
	}

};