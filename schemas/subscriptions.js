const mongoose = require("mongoose");

const subscriptionsSchema = new mongoose.Schema({
	type: { type: String, default: "" },
	topic: { type: String, default: "" },
	callback: { type: String, default: "" },
	expires: { type: Date }
}, {
	timestamps: {
		createdAt: "created",
		updatedAt: "updated"
	}
});

module.exports = mongoose.model("Subscriptions", subscriptionsSchema);