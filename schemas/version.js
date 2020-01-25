const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema({
	version: { type: String, default: "1.0.0" },
	fileName: { type: String, default: "" },
	size: { type: Number, default: 0 },
	hash: { type: String, default: "" }
}, {
	timestamps: {
		createdAt: "created",
		updatedAt: "updated"
	}
});

module.exports = mongoose.model("Version", versionSchema);