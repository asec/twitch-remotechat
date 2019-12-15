const mongoose = require("mongoose");

const chatsSchema = new mongoose.Schema({
	channel: { type: String, default: "" },
	context: { type: mongoose.Schema.Types.Mixed, default: {} },
	message: { type: String, default: "" },
	stream: { type: mongoose.Schema.Types.ObjectId, ref: "Streams", sparse: true }
}, {
	timestamps: {
		createdAt: "created",
		updatedAt: "updated"
	}
});

module.exports = mongoose.model("Chats", chatsSchema);