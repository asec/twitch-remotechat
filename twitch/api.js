const config = require("../config/config"),
	axios = require("axios");

module.exports = {

	getAccessToken()
	{
		return axios.post(config.twitch.oauthUrl + "/token", null, {
			params: {
				client_id: config.twitch.clientId,
				client_secret: config.twitch.clientSecret,
				grant_type: "client_credentials"
			}
		});
	},

	subscribe(leaseSeconds)
	{
		return axios.post(config.twitch.apiUrl + "/webhooks/hub", {
			"hub.callback": config.twitch.statusCallback,
			"hub.mode": "subscribe",
			"hub.topic": config.twitch.apiUrl + "/streams?user_id=" + config.twitch.userId,
			"hub.lease_seconds": leaseSeconds,
			"hub.secret": config.twitch.secret
		}, {
			headers: {
				"Client-ID": config.twitch.clientId
			}
		});
	},

	getGame(id)
	{
		return axios.get(config.twitch.apiUrl + "/games?id=" + id, {
			headers: {
				"Client-ID": config.twitch.clientId
			}
		});
	}

};