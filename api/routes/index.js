module.exports = {

	get: {
		streamStatusChanged: require("./get/stream-status-changed"),
		stream: require("./get/stream"),
		chat: require("./get/chat")
	},

	post: {
		streamStatusChanged: require("./post/stream-status-changed")
	},

	put: {
		chat: require("./put/chat")
	}

};