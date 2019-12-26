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
	twitch: {
		clientId: secret.clientId,
		clientSecret: secret.clientSecret,
		apiUrl: "https://api.twitch.tv/helix",
		oauthUrl: "https://id.twitch.tv/oauth2",
		statusCallback: "http://" + secret.serverIp + ":7332/stream-status-changed",
		secret: "xV!k?]GH+#Y!,fDuCZB]49gw#tspaZ)Q"
	}

};