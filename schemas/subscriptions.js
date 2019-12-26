const mongoose = require("mongoose");

const subscriptionsSchema = new mongoose.Schema({
	userId: { type: String, default: "" },
	userName: { type: String, default: "" },
	image: { type: String, default: "" },
	topic: { type: String, default: "" },
	callback: { type: String, default: "" },
	expiration: { type: Number, default: 0 },
	confirmed: { type: Boolean, default: false }
}, {
	timestamps: {
		createdAt: "created",
		updatedAt: "updated"
	}
});

module.exports = mongoose.model("Subscriptions", subscriptionsSchema);