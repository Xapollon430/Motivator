const Token = require("../db/Token");
const fetch = require("node-fetch");
const jwt = require("jsonwebtoken");

let monthsWith31Days = [1, 3, 5, 7, 8, 10, 12];
let monthsWith30Days = [4, 6, 9, 11];

const getDesigner = async (req, res) => {
	let { name } = req.query;
	let { deals, sets } = await getDesinerData(name);

	let designerInfo = await getDealsAndSales(deals, sets, name);
	console.log(designerInfo.lastMonthDealsAndSets.salesWon);
	res.json([designerInfo.lastMonthDealsAndSets, designerInfo.lastWeekDealsAndSets, designerInfo.thisMonthDealsAndSets]);
};

const getNation = async (req, res) => {
	let { name } = req.query;
	let { nationDeals, nationSets, filteredUsers } = await getNationData(name);
	let nationInfo = [];
	let lastMonthInfo = {
		sortedSets: [],
		sortedDeals: [],
		revenueGenerated: 0,
		salesWon: [],
		averageSale: 0
	};
	let lastWeekInfo = {
		sortedSets: [],
		sortedDeals: [],
		revenueGenerated: 0,
		salesWon: [],
		averageSale: 0
	};
	let thisMonthInfo = {
		sortedSets: [],
		sortedDeals: [],
		revenueGenerated: 0,
		salesWon: [],
		averageSale: 0
	};

	for (let i = 0; i < filteredUsers.length; i++) {
		nationInfo.push(await getDealsAndSales(nationDeals, nationSets, filteredUsers[i]));
	}

	for (let i = 0; i < nationInfo.length; i++) {
		lastMonthInfo.sortedDeals.push(...nationInfo[i].lastMonthDealsAndSets.sortedDeals);
		lastMonthInfo.sortedSets.push(...nationInfo[i].lastMonthDealsAndSets.sortedSets);
		lastMonthInfo.revenueGenerated += nationInfo[i].lastMonthDealsAndSets.revenueGenerated;
		lastMonthInfo.salesWon.push(...nationInfo[i].lastMonthDealsAndSets.salesWon);
		lastWeekInfo.sortedDeals.push(...nationInfo[i].lastWeekDealsAndSets.sortedDeals);
		lastWeekInfo.sortedSets.push(...nationInfo[i].lastWeekDealsAndSets.sortedSets);
		lastWeekInfo.revenueGenerated += nationInfo[i].lastWeekDealsAndSets.revenueGenerated;
		lastWeekInfo.salesWon.push(...nationInfo[i].lastWeekDealsAndSets.salesWon);
		thisMonthInfo.sortedDeals.push(...nationInfo[i].thisMonthDealsAndSets.sortedDeals);
		thisMonthInfo.sortedSets.push(...nationInfo[i].thisMonthDealsAndSets.sortedSets);
		thisMonthInfo.revenueGenerated += nationInfo[i].thisMonthDealsAndSets.revenueGenerated;
		thisMonthInfo.salesWon.push(...nationInfo[i].thisMonthDealsAndSets.salesWon);
	}

	lastMonthInfo.averageSale = lastMonthInfo.revenueGenerated / lastMonthInfo.salesWon.length;
	lastWeekInfo.averageSale = lastWeekInfo.revenueGenerated / lastWeekInfo.salesWon.length;
	thisMonthInfo.averageSale = thisMonthInfo.revenueGenerated / thisMonthInfo.salesWon.length;

	res.json([lastMonthInfo, lastWeekInfo, thisMonthInfo]);
};

const getUsers = async (req, res) => {
	let { usersEndPoint, nationsEndPoint } = await getUsersName();
	res.json({
		usersEndPoint,
		nationsEndPoint
	});
};

const Login = async (req, res) => {
	let { username, password } = req.body;
	if (username === process.env.ADMIN_LOGIN && password === process.env.ADMIN_PASSWORD) {
		let token = jwt.sign({}, "secret");
		await Token.jwtToken.create({
			jwtToken: token
		});

		res.status(200).send({
			token
		});
	} else {
		res.status(400).send({
			error: "Wrong username or password"
		});
	}
};

const getNationData = async nation => {
	let accessToken = await Token.getAccessToken();
	let filteredUsers = await getUsersName(nation);
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

	let deals = deals1.concat(deals2).concat(deals3);

	let sets = sets1.concat(sets2);

	return {
		nationDeals: deals,
		nationSets: sets,
		filteredUsers
	};
};

const getUsersName = async nation => {
	accessToken = await Token.getAccessToken();
	let filteredUsers = [];

	let usersResponse = await fetch(`https://www.zohoapis.com/crm/v2/users?type=ActiveUsers`, {
		headers: {
			"Authorization": `Zoho-oauthtoken ${accessToken}`
		}
	});

	let { users } = await usersResponse.json();

	if (!nation) {
		// returns all active users and nations

		let usersEndPoint = [];
		let nationsEndPoint = [];

		for (let i = 0; i < users.length; i++) {
			usersEndPoint.push(users[i].full_name);
		}
		for (let i = 0; i < users.length; i++) {
			nationsEndPoint.push(users[i].territories[0].name);
		}

		nationsEndPoint = [...new Set(nationsEndPoint)];

		return {
			usersEndPoint,
			nationsEndPoint
		};
	}

	for (let i = 0; i < users.length; i++) {
		// returns users for a speicific nation

		if (users[i].territories[0].name === nation) {
			filteredUsers.push(users[i].full_name);
		}
	}
	return filteredUsers;
};

const getDesinerData = async name => {
	accessToken = await Token.getAccessToken();
	let dealsResponse = await fetch(
		`https://www.zohoapis.com/crm/v2/Deals/search?criteria=(Owner.name.:equals:${name})&sort_order=desc&sort_by=Created_Time`,
		{
			headers: {
				"Authorization": `Zoho-oauthtoken ${accessToken}`
			}
		}
	);
	let { data: deals } = await dealsResponse.json();

	let setsResponse = await fetch(
		`https://www.zohoapis.com/crm/v2/Contacts/search?criteria=(Owner.name.:equals:${name})&sort_order=desc&sort_by=Created_Time`,
		{
			headers: {
				"Authorization": `Zoho-oauthtoken ${accessToken}`
			}
		}
	);

	let { data: sets } = await setsResponse.json();

	return {
		deals,
		sets
	};
};

const getDealsAndSales = async (deals, sets, name) => {
	let lastMonthDealsAndSets = getLastMonthDealsAndSets(deals, sets, name);
	let lastWeekDealsAndSets = getLastWeekDealsAndSets(deals, sets, name);
	let thisMonthDealsAndSets = getThisMonthDealsAndSets(deals, sets, name);
	return {
		lastMonthDealsAndSets,
		lastWeekDealsAndSets,
		thisMonthDealsAndSets
	};
};

const getLastMonthDealsAndSets = (deals, sets, name) => {
	let dateNow = new Date();
	let beginningLastMonth = new Date(`${dateNow.getUTCFullYear()}-${dateNow.getUTCMonth()}-01`);
	let endLastMonth = new Date();
	let revenueGenerated = 0;
	let averageSale = 0;

	if (dateNow.getUTCMonth() === 0) {
		beginningLastMonth = new Date(`${dateNow.getUTCFullYear()}-12-01`);
		endLastMonth = new Date(`${dateNow.getUTCFullYear()}-12-31`);
	} else if (dateNow.getUTCMonth() === 2) {
		endLastMonth = new Date(`${dateNow.getUTCFullYear()}-02-28`);
	} else if (monthsWith30Days.includes(dateNow.getUTCMonth())) {
		endLastMonth = new Date(`${dateNow.getUTCFullYear()}-${dateNow.getUTCMonth()}-30`);
	} else if (monthsWith31Days.includes(dateNow.getUTCMonth())) {
		endLastMonth = new Date(`${dateNow.getUTCFullYear()}-${dateNow.getUTCMonth()}-31`);
	}

	dateNow.setUTCHours(0, 0, 0, 0);
	beginningLastMonth.setUTCHours(0, 0, 0, 0);
	endLastMonth.setUTCHours(0, 0, 0, 0);

	let sortedDeals = deals.filter(record => {
		let date = new Date(record.Created_Time.substring(0, 10));
		if (date >= beginningLastMonth && date <= endLastMonth && record.Owner.name === name) {
			return record;
		}
	});

	let salesWon = deals.filter(record => {
		let date = new Date(record.Closing_Date);

		if (
			date >= beginningLastMonth &&
			date <= endLastMonth &&
			record.Stage === "Closed Won" &&
			record.Owner.name === name
		) {
			return record;
		}
	});

	let sortedSets = sets.filter(record => {
		let date = new Date(record.Created_Time.substring(0, 10));
		if (date >= beginningLastMonth && date <= endLastMonth && record.Owner.name === name) {
			return record;
		}
	});

	for (let sale of salesWon) {
		revenueGenerated += sale.Amount;
	}

	averageSale = revenueGenerated / salesWon.length;

	if (!averageSale) {
		averageSale = 0;
	}
	if (!revenueGenerated) {
		revenueGenerated = 0;
	}

	return {
		sortedSets,
		sortedDeals,
		revenueGenerated,
		salesWon,
		averageSale
	};
};

const getLastWeekDealsAndSets = (deals, sets, name) => {
	let dateNow = new Date();
	let beginningWeek = new Date();
	let endWeek = new Date();
	let revenueGenerated = 0;
	let averageSale = 0;

	if (dateNow.getUTCDay() === 0) {
		beginningWeek.setUTCDate(dateNow.getUTCDate() - 13);
		endWeek.setUTCDate(dateNow.getUTCDate() - 7);
	} else {
		beginningWeek.setUTCDate(dateNow.getUTCDate() - (dateNow.getUTCDay() + 6));
		endWeek.setUTCDate(dateNow.getUTCDate() - dateNow.getUTCDay());
	}

	beginningWeek.setUTCHours(0, 0, 0, 0);
	endWeek.setUTCHours(0, 0, 0, 0);

	let sortedDeals = deals.filter(record => {
		let date = new Date(record.Created_Time.substring(0, 10));
		if (date >= beginningWeek && date <= endWeek && record.Owner.name === name) {
			return record;
		}
	});

	let salesWon = deals.filter(record => {
		let date = new Date(record.Closing_Date.substring(0, 10));
		if (date >= beginningWeek && date <= endWeek && record.Stage === "Closed Won" && record.Owner.name === name) {
			return record;
		}
	});

	let sortedSets = sets.filter(record => {
		let date = new Date(record.Created_Time.substring(0, 10));
		if (date >= beginningWeek && date <= endWeek && record.Owner.name === name) {
			return record;
		}
	});

	for (let sale of salesWon) {
		revenueGenerated += sale.Amount;
	}

	averageSale = revenueGenerated / salesWon.length;

	if (!averageSale) {
		averageSale = 0;
	}
	if (!revenueGenerated) {
		revenueGenerated = 0;
	}

	return {
		sortedSets,
		sortedDeals,
		revenueGenerated,
		salesWon,
		averageSale
	};
};

const getThisMonthDealsAndSets = (deals, sets, name) => {
	let dateNow = new Date();
	let beginningMonth = new Date(`${dateNow.getUTCFullYear()}-${dateNow.getUTCMonth() + 1}-1`);
	let endOfMonth;
	let revenueGenerated = 0;
	let averageSale = 0;

	if (monthsWith30Days.includes(dateNow.getUTCMonth() + 1)) {
		endOfMonth = new Date(`${dateNow.getUTCFullYear()}-${dateNow.getUTCMonth() + 1}-30`);
	} else if (monthsWith31Days.includes(dateNow.getUTCMonth() + 1)) {
		endOfMonth = new Date(`${dateNow.getUTCFullYear()}-${dateNow.getUTCMonth() + 1}-31`);
	} else {
		endOfMonth = new Date(`${dateNow.getUTCFullYear()}-${dateNow.getUTCMonth() + 1}-28`);
	}

	beginningMonth.setUTCHours(0, 0, 0, 0);
	endOfMonth.setUTCHours(0, 0, 0, 0);

	let sortedDeals = deals.filter(record => {
		let date = new Date(record.Created_Time.substring(0, 10));

		if (date >= beginningMonth && date <= dateNow && record.Owner.name === name) {
			return record;
		}
	});

	let salesWon = deals.filter(record => {
		let date = new Date(record.Closing_Date);
		if (date >= beginningMonth && date <= endOfMonth && record.Stage === "Closed Won" && record.Owner.name === name) {
			return record;
		}
	});

	let sortedSets = sets.filter(record => {
		let date = new Date(record.Created_Time.substring(0, 10));

		if (date >= beginningMonth && date <= endOfMonth && record.Owner.name === name) {
			return record;
		}
	});

	for (let sale of salesWon) {
		revenueGenerated += sale.Amount;
	}

	averageSale = revenueGenerated / salesWon.length;

	if (!averageSale) {
		averageSale = 0;
	}
	if (!revenueGenerated) {
		revenueGenerated = 0;
	}

	return {
		sortedSets,
		sortedDeals,
		revenueGenerated,
		salesWon,
		averageSale
	};
};

module.exports = {
	getDesigner,
	getNation,
	getUsers,
	Login
};
