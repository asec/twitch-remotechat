const mongoose = require('mongoose');

const logsSchema = new mongoose.Schema({
	type: { type: String, default: "info" },
	action: { type: String, default: "basic log" },
	data: {}
}, {
	timestamps: {
		createdAt: "created",
		updatedAt: "updated"
	}
});

module.exports = mongoose.model("Logs", logsSchema);