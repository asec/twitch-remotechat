const mongoose = require("mongoose");

const streamsSchema = new mongoose.Schema({
	sid: { type: String, default: "" },
	isLive: { type: Boolean, default: false },
	userId: { type: String, default: "" },
	userName: { type: String, default: "" },
	game: { type: mongoose.Schema.Types.ObjectId, ref: "Games", sparse: true },
	type: { type: String, default: "" },
	title: { type: String, default: "" },
	thumbnail: { type: String, default: "" }
}, {
	timestamps: {
		createdAt: "created",
		updatedAt: "updated"
	}
});

module.exports = mongoose.model("Streams", streamsSchema);