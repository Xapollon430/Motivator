const mongoose = require("mongoose");
const fetch = require("node-fetch");
const dotenv = require("dotenv");

let sets;
let deals;

dotenv.config();

mongoose.set("useCreateIndex", true);

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

const getSales = async () => {
	if (sets && deals) {
		return {
			deals,
			sets
		};
	}

	let salesData = await createSales();

	sets = salesData.sets;
	deals = salesData.deals;

	return {
		deals,
		sets
	};
};

const createSales = async () => {
	let accessToken = await getAccessToken();

	let dealsResponse1 = await fetch(`https://www.zohoapis.com/crm/v2/Deals?sort_order=desc&sort_by=Created_Time`, {
		headers: {
			"Authorization": `Zoho-oauthtoken ${accessToken}`
		}
	});
	let { data: deals1 } = await dealsResponse1.json();

	let dealsResponse2 = await fetch(
		`https://www.zohoapis.com/crm/v2/Deals?sort_order=desc&sort_by=Created_Time&page=2`,
		{
			headers: {
				"Authorization": `Zoho-oauthtoken ${accessToken}`
			}
		}
	);
	let { data: deals2 } = await dealsResponse2.json();

	let dealsResponse3 = await fetch(
		`https://www.zohoapis.com/crm/v2/Deals?sort_order=desc&sort_by=Created_Time&page=3`,
		{
			headers: {
				"Authorization": `Zoho-oauthtoken ${accessToken}`
			}
		}
	);
	let { data: deals3 } = await dealsResponse3.json();

	let dealsResponse4 = await fetch(
		`https://www.zohoapis.com/crm/v2/Deals?sort_order=desc&sort_by=Created_Time&page=4`,
		{
			headers: {
				"Authorization": `Zoho-oauthtoken ${accessToken}`
			}
		}
	);
	let { data: deals4 } = await dealsResponse4.json();

	let dealsResponse5 = await fetch(
		`https://www.zohoapis.com/crm/v2/Deals?sort_order=desc&sort_by=Created_Time&page=5`,
		{
			headers: {
				"Authorization": `Zoho-oauthtoken ${accessToken}`
			}
		}
	);
	let { data: deals5 } = await dealsResponse5.json();

	let dealsResponse6 = await fetch(
		`https://www.zohoapis.com/crm/v2/Deals?sort_order=desc&sort_by=Created_Time&page=6`,
		{
			headers: {
				"Authorization": `Zoho-oauthtoken ${accessToken}`
			}
		}
	);
	let { data: deals6 } = await dealsResponse6.json();

	let setsResponse1 = await fetch(`https://www.zohoapis.com/crm/v2/Contacts?sort_order=desc&sort_by=Created_Time`, {
		headers: {
			"Authorization": `Zoho-oauthtoken ${accessToken}`
		}
	});

	let { data: sets1 } = await setsResponse1.json();

	let setsResponse2 = await fetch(
		`https://www.zohoapis.com/crm/v2/Contacts?sort_order=desc&sort_by=Created_Time&page=2`,
		{
			headers: {
				"Authorization": `Zoho-oauthtoken ${accessToken}`
			}
		}
	);

	let { data: sets2 } = await setsResponse2.json();

	let setsResponse3 = await fetch(
		`https://www.zohoapis.com/crm/v2/Contacts?sort_order=desc&sort_by=Created_Time&page=3`,
		{
			headers: {
				"Authorization": `Zoho-oauthtoken ${accessToken}`
			}
		}
	);

	let { data: sets3 } = await setsResponse3.json();

	let deals = deals1
		.concat(deals2)
		.concat(deals3)
		.concat(deals4)
		.concat(deals5)
		.concat(deals6);

	let sets = sets1.concat(sets2).concat(sets3);

	return { deals, sets };
};

module.exports = {
	getAccessToken,
	jwtToken,
	getSales
};
