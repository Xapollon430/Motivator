const mongoose = require("mongoose");
const fetch = require("node-fetch");
const dotenv = require("dotenv");
dotenv.config();

mongoose.set("useCreateIndex", true);

mongoose.connect(`${process.env.MONGODB_CONNECTION_STRING}`, {
	useUnifiedTopology: true,
	useNewUrlParser: true
});

mongoose.connect(`${process.env.MONGODB_CONNECTION_STRING}`, {
	useUnifiedTopology: true,
	useNewUrlParser: true
});

let jwtTokenSchema = new mongoose.Schema({
	jwtToken: {
		type: String
	},
	expireAt: {
		type: Date,
		default: Date.now(),
		expires: 10000
	}
});

let accessTokenSchema = new mongoose.Schema({
	accessToken: {
		type: String,
		required: true
	},
	expireAt: {
		type: Date,
		default: Date.now(),
		expires: 3000
	}
});

let AccessTokenModel = mongoose.model("accessToken", accessTokenSchema);
let jwtToken = mongoose.model("jwtToken", jwtTokenSchema);

const createAccessToken = async () => {
	let tokenResponse = await fetch(
		`https://accounts.zoho.com/oauth/v2/token?grant_type=refresh_token&refresh_token=${process.env.REFRESH_TOKEN}&client_secret=${process.env.CLIENT_SECRET}&client_id=${process.env.CLIENT_ID}`,
		{
			method: "POST"
		}
	);
	let accessToken = await tokenResponse.json();

	let accessTokenFromDB = AccessTokenModel.create({
		accessToken: accessToken.access_token
	});

	return accessTokenFromDB;
};

const getAccessToken = async () => {
	let accessTokenFromDB = await AccessTokenModel.findOne();
	if (accessTokenFromDB) {
		return accessTokenFromDB.accessToken;
	}

	let newCreatedAccessToken = await createAccessToken();
	return newCreatedAccessToken.accessToken;
};

module.exports = {
	getAccessToken,
	jwtToken
};
