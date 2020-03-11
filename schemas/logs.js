const mongoose = require('mongoose');

const logsSchema = new mongoose.Schema({
	action: { type: String, default: "basic log" },
	data: {}
}, {
	timestamps: {
		createdAt: "created",
		updatedAt: "updated"
	}
});