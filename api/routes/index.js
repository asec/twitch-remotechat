module.exports = {

	get: {
		streamStatusChanged: require('./get/stream-status-changed'),
		stream: require('./get/stream'),
		chat: require('./get/chat'),
		subscriptions: require('./get/subscriptions'),

		bot: {
			status: require('./get/bot/status')
		}
	},

	post: {
		streamStatusChanged: require('./post/stream-status-changed'),
		subscribe: require('./post/subscribe')
	},

	put: {
		chat: require('./put/chat'),
		version: require('./put/version')
	},

	delete: {
		subscription: require('./delete/subscription')
	}

};