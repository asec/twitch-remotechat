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

	getWebhookSubscriptions(first, accessToken)
	{
		first = first || 20;
		return axios.get(config.twitch.apiUrl + "/webhooks/subscriptions?first=" + first, {
			headers: {
				"Authorization": "Bearer " + accessToken
			}
		});
	},

	subscribe(userId, leaseSeconds)
	{
		return axios.post(config.twitch.apiUrl + "/webhooks/hub", {
			"hub.callback": config.twitch.statusCallback + "?userId=" + userId,
			"hub.mode": "subscribe",
			"hub.topic": config.twitch.apiUrl + "/streams?user_id=" + userId,
			"hub.lease_seconds": leaseSeconds,
			"hub.secret": config.twitch.secret
		}, {
			headers: {
				"Client-ID": config.twitch.clientId
			}
		});
	},

	unsubscribe(userId, leaseSeconds)
	{
		return axios.post(config.twitch.apiUrl + "/webhooks/hub", {
			"hub.callback": config.twitch.statusCallback,
			"hub.mode": "unsubscribe",
			"hub.topic": config.twitch.apiUrl + "/streams?user_id=" + userId,
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
	},

	getUserById(id)
	{
		return axios.get(config.twitch.apiUrl + "/users?id=" + id, {
			headers: {
				"Client-ID": config.twitch.clientId
			}
		});
	},

	getUserByName(name)
	{
		return axios.get(config.twitch.apiUrl + "/users?login=" + name, {
			headers: {
				"Client-ID": config.twitch.clientId
			}
		});
	}

};