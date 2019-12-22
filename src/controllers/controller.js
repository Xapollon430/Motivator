const DB = require("../db/database");
const fetch = require("node-fetch");
const jwt = require("jsonwebtoken");
const sortData = require("./helperSort");

let monthsWith31Days = [1, 3, 5, 7, 8, 10, 12];
let monthsWith30Days = [4, 6, 9, 11];

const getDesigner = async (req, res) => {
	let { name } = req.query;
	let { deals, sets } = await DB.getSales(name);

	let { thisMonthInfo, lastMonthInfo, lastWeekInfo } = getDealsAndSales(deals, sets, name);

	let { thisMonthInfo } = designerInfo;
	let { lastMonthInfo } = designerInfo;
	let { lastWeekInfo } = designerInfo;

	let salesWonForProductsSold = lastWeekInfo.salesWon;
	let setsForCustomerSource = lastWeekInfo.sortedSets;

	let weeklyProductsAndCustomerSource = getWeeklyProductsAndCustomerSource(
		salesWonForProductsSold,
		setsForCustomerSource
	);

	res.json([thisMonthInfo, lastMonthInfo, lastWeekInfo, weeklyProductsAndCustomerSource]);
};

const getNation = async (req, res) => {
	let { name } = req.query;
	let { deals, sets } = await DB.getSales();
	let filteredUsers = await getUsersName(name);
	let nationSalesInfo = [];

	for (let i = 0; i < filteredUsers.length; i++) {
		nationSalesInfo.push(await getDealsAndSales(deals, sets, filteredUsers[i]));
	}

	let { thisMonthInfo, lastMonthInfo, lastWeekInfo } = sortData(nationSalesInfo);

	let salesWonForProductsSold = lastWeekInfo.salesWon;
	let setsForCustomerSource = lastWeekInfo.sortedSets;

	let weeklyProductsAndCustomerSource = getWeeklyProductsAndCustomerSource(
		salesWonForProductsSold,
		setsForCustomerSource
	);

	res.json([thisMonthInfo, lastMonthInfo, lastWeekInfo, weeklyProductsAndCustomerSource]);
};

const getUsers = async (req, res) => {
	let { usersEndPoint, nationsEndPoint } = await getUsersName();
	nationsEndPoint.unshift("Company");
	res.json({
		usersEndPoint,
		nationsEndPoint
	});
};

const getCompany = async (req, res) => {
	let { usersEndPoint } = await getUsersName();
	let { deals, sets } = await DB.getSales();

	let salesInfo = [];

	for (let i = 0; i < filteredUsers.length; i++) {
		salesInfo.push(await getDealsAndSales(deals, sets, usersEndPoint[i]));
	}

	let { thisMonthInfo, lastMonthInfo, lastWeekInfo } = sortData(salesInfo);

	let salesWonForProductsSold = lastWeekInfo.salesWon;
	let setsForCustomerSource = lastWeekInfo.sortedSets;

	let weeklyProductsAndCustomerSource = getWeeklyProductsAndCustomerSource(
		salesWonForProductsSold,
		setsForCustomerSource
	);

	res.json([thisMonthInfo, lastMonthInfo, lastWeekInfo, weeklyProductsAndCustomerSource]);
};

const Login = async (req, res) => {
	let { username, password } = req.body;

	if (username === process.env.ADMIN_LOGIN && password === process.env.ADMIN_PASSWORD) {
		let token = jwt.sign({}, "secret");
		await DB.jwtToken.create({
			jwtToken: token
		});

		res.status(200).send({
			token
		});
	} else {
		res.status(400).send({
			error: `Wrong username or password`
		});
	}
};

const getUsersName = async nation => {
	accessToken = await DB.getAccessToken();
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

const getDealsAndSales = (deals, sets, name) => {
	let thisMonthInfo = getThisMonthDealsAndSets(deals, sets, name);
	let lastMonthInfo = getLastMonthDealsAndSets(deals, sets, name);
	let lastWeekInfo = getLastWeekDealsAndSets(deals, sets, name);
	return {
		lastMonthInfo,
		thisMonthInfo,
		lastWeekInfo
	};
};

const getWeeklyProductsAndCustomerSource = (deals, sets) => {
	function sortUnique(arr) {
		var a = [],
			b = [],
			prev;

		arr.sort();
		for (var i = 0; i < arr.length; i++) {
			if (arr[i] !== prev) {
				a.push(arr[i]);
				b.push(1);
			} else {
				b[b.length - 1]++;
			}
			prev = arr[i];
		}

		return [a, b];
	}

	let projectType = sets.map(set => {
		return set.Project_Type;
	});

	let productsInvolved = deals.map(deal => {
		return deal.Products_Involved;
	});

	productsInvolved = [].concat.apply([], productsInvolved); // flattens array

	let sortedProjectType = sortUnique(projectType);
	let sortedProductsInvolved = sortUnique(productsInvolved);

	return {
		sortedProjectType,
		sortedProductsInvolved
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
	getCompany,
	Login
};
