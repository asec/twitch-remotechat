const mongoose = require("mongoose");

const gamesSchema = new mongoose.Schema({
	gid: { type: String },
	name: { type: String, default: "" },
	image: { type: String, default: "" }
}, {
	timestamps: {
		createdAt: "created",
		updatedAt: "updated"
	}
});

module.exports = mongoose.model("Games", gamesSchema);