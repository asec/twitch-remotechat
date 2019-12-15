const mongoose = require("mongoose");

const accessTokenSchema = new mongoose.Schema({
	token: { type: String, default: "" },
	expiration: { type: Number, default: 0 }
}, {
	timestamps: {
		createdAt: "created",
		updatedAt: "updated"
	}
});

module.exports = mongoose.model("AccessToken", accessTokenSchema);