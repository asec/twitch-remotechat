const crypto = require('crypto'),
	config = require('../config/config');

const IV_LENGTH = 16;

module.exports = {

	encrypt: function(text)
	{
		let iv = crypto.randomBytes(IV_LENGTH);
		let cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(config.encryptionKey), iv);
		let encrypted = cipher.update(text);
		encrypted = Buffer.concat([encrypted, cipher.final()]);
		return iv.toString("hex") + ":" + encrypted.toString("hex");
	},

	decrypt: function(text)
	{
		let textParts = text.split(":");
		let iv = Buffer.from(textParts.shift(), "hex");
		let encryptedText = Buffer.from(textParts.join(":"), "hex");
		let decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(config.encryptionKey), iv);
		let decrypted = decipher.update(encryptedText);
		decrypted = Buffer.concat([decrypted, decipher.final()]);
		return decrypted.toString();
	}

};