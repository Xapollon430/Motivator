const DB = require("../db/database");
const fetch = require("node-fetch");
const jwt = require("jsonwebtoken");
const sortData = require("./helperSort");
const xlsx = require("xlsx");
const nodemailer = require("nodemailer");

let monthsWith31Days = [1, 3, 5, 7, 8, 10, 12];
let monthsWith30Days = [4, 6, 9, 11];
const monthNames = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December"
];

const getDesigner = async (req, res) => {
	let { name } = req.query;
	let { deals, sets } = await DB.getSales();

	let { thisMonthInfo, lastMonthInfo, lastYearThisMonth } = getDealsAndSales(deals, sets, name);

	let salesWonForProductsSold = lastMonthInfo.salesWon;
	let setsForCustomerSource = lastMonthInfo.sortedSets;

	let weeklyProductsAndCustomerSource = getProductsAndCustomerSource(salesWonForProductsSold, setsForCustomerSource);

	res.json([thisMonthInfo, lastMonthInfo, lastYearThisMonth, weeklyProductsAndCustomerSource]);
};

const getNation = async (req, res) => {
	let { name } = req.query;
	let { deals, sets } = await DB.getSales();
	let filteredUsers = await getUsersName(name);
	let nationSalesInfo = [];

	for (let i = 0; i < filteredUsers.length; i++) {
		nationSalesInfo.push(await getDealsAndSales(deals, sets, filteredUsers[i]));
	}

	let { thisMonthInfo, lastMonthInfo, lastYearThisMonth } = sortData(nationSalesInfo);

	let salesWonForProductsSold = lastMonthInfo.salesWon;
	let setsForCustomerSource = lastMonthInfo.sortedSets;

	let weeklyProductsAndCustomerSource = getProductsAndCustomerSource(salesWonForProductsSold, setsForCustomerSource);

	res.json([thisMonthInfo, lastMonthInfo, lastYearThisMonth, weeklyProductsAndCustomerSource]);
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
	let { deals, sets } = await DB.getSales();

	let salesInfo = await getDealsAndSalesForCompany(deals, sets);

	let salesWonForProductsSoldThisWeek = salesInfo.lastMonthInfo.salesWon;
	let setsForCustomerSourceThisWeek = salesInfo.lastMonthInfo.sortedSets;
	let salesWonForProductsSoldThisMonth = salesInfo.thisMonthInfo.salesWon;
	let setsForCustomerSourceThisMonth = salesInfo.thisMonthInfo.sortedSets;

	let weeklyProductsAndCustomerSource = getProductsAndCustomerSource(
		salesWonForProductsSoldThisWeek,
		setsForCustomerSourceThisWeek
	);
	let thisMonthProductsAndCustomerSource = getProductsAndCustomerSource(
		salesWonForProductsSoldThisMonth,
		setsForCustomerSourceThisMonth
	);

	res.json([
		salesInfo.thisMonthInfo,
		salesInfo.lastMonthInfo,
		salesInfo.lastYearThisMonth,
		weeklyProductsAndCustomerSource,
		thisMonthProductsAndCustomerSource
	]);
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
	let lastYearThisMonth = getLastYearThisMonth(deals, sets, name);
	return {
		lastMonthInfo,
		thisMonthInfo,
		lastYearThisMonth
	};
};

const getDealsAndSalesForCompany = (deals, sets) => {
	let thisMonthInfo = getThisMonthDealsAndSetsForCompany(deals, sets);
	let lastMonthInfo = getLastMonthDealsAndSetsForCompany(deals, sets);
	let lastYearThisMonth = getLastYearThisMonthForCompany(deals, sets);
	return {
		lastMonthInfo,
		thisMonthInfo,
		lastYearThisMonth
	};
};

const getProductsAndCustomerSource = (deals, sets) => {
	function sortUnique(arr) {
		//https://stackoverflow.com/questions/5667888/counting-the-occurrences-frequency-of-array-elements
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

const getLastYearThisMonthForCompany = (deals, sets) => {
	let dateNow = new Date();
	let beginningLastYearThisMonth = new Date(`${dateNow.getUTCFullYear() - 1}-${dateNow.getUTCMonth()}-01`);
	let endLastYearThisMonth = new Date();
	let revenueGenerated = 0;
	let averageSale = 0;

	if (dateNow.getUTCMonth() === 0) {
		beginningLastYearThisMonth = new Date(`${dateNow.getUTCFullYear() - 1}-1-01`);
		endLastYearThisMonth = new Date(`${dateNow.getUTCFullYear() - 1}-01-31`);
	} else if (dateNow.getUTCMonth() === 2) {
		endLastYearThisMonth = new Date(`${dateNow.getUTCFullYear() - 1}-02-28`);
	} else if (monthsWith30Days.includes(dateNow.getUTCMonth())) {
		endLastYearThisMonth = new Date(`${dateNow.getUTCFullYear() - 1}-${dateNow.getUTCMonth()}-30`);
	} else if (monthsWith31Days.includes(dateNow.getUTCMonth())) {
		endLastYearThisMonth = new Date(`${dateNow.getUTCFullYear() - 1}-${dateNow.getUTCMonth()}-31`);
	}

	dateNow.setUTCHours(0, 0, 0, 0);
	beginningLastYearThisMonth.setUTCHours(0, 0, 0, 0);
	endLastYearThisMonth.setUTCHours(0, 0, 0, 0);

	let sortedDeals = deals.filter(record => {
		let date = new Date(record.Created_Time.substring(0, 10));
		if (date >= beginningLastYearThisMonth && date <= endLastYearThisMonth) {
			return record;
		}
	});

	let salesWon = deals.filter(record => {
		let date = new Date(record.Closing_Date);

		if (date >= beginningLastYearThisMonth && date <= endLastYearThisMonth && record.Stage === "Closed Won") {
			return record;
		}
	});

	let sortedSets = sets.filter(record => {
		let date = new Date(record.Created_Time.substring(0, 10));
		if (date >= beginningLastYearThisMonth && date <= endLastYearThisMonth) {
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

const getLastMonthDealsAndSetsForCompany = (deals, sets, name) => {
	let dateNow = new Date();
	let beginningLastMonth = new Date(`${dateNow.getUTCFullYear()}-${dateNow.getUTCMonth()}-01`);
	let endLastMonth = new Date();
	let revenueGenerated = 0;
	let averageSale = 0;

	if (dateNow.getUTCMonth() === 0) {
		beginningLastMonth = new Date(`${dateNow.getUTCFullYear() - 1}-12-01`);
		endLastMonth = new Date(`${dateNow.getUTCFullYear() - 1}-12-31`);
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
		if (date >= beginningLastMonth && date <= endLastMonth) {
			return record;
		}
	});

	let salesWon = deals.filter(record => {
		let date = new Date(record.Closing_Date);

		if (date >= beginningLastMonth && date <= endLastMonth && record.Stage === "Closed Won") {
			return record;
		}
	});

	let sortedSets = sets.filter(record => {
		let date = new Date(record.Created_Time.substring(0, 10));
		if (date >= beginningLastMonth && date <= endLastMonth) {
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

const getThisMonthDealsAndSetsForCompany = (deals, sets, name) => {
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

		if (date >= beginningMonth && date <= dateNow) {
			return record;
		}
	});

	let salesWon = deals.filter(record => {
		let date = new Date(record.Closing_Date);
		if (date >= beginningMonth && date <= endOfMonth && record.Stage === "Closed Won") {
			return record;
		}
	});

	let sortedSets = sets.filter(record => {
		let date = new Date(record.Created_Time.substring(0, 10));

		if (date >= beginningMonth && date <= endOfMonth) {
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

const getLastYearThisMonth = (deals, sets, name) => {
	let dateNow = new Date();
	let beginningLastYearThisMonth = new Date(`${dateNow.getUTCFullYear() - 1}-${dateNow.getUTCMonth()}-01`);
	let endLastYearThisMonth = new Date();
	let revenueGenerated = 0;
	let averageSale = 0;

	if (dateNow.getUTCMonth() === 0) {
		beginningLastYearThisMonth = new Date(`${dateNow.getUTCFullYear() - 1}-1-01`);
		endLastYearThisMonth = new Date(`${dateNow.getUTCFullYear() - 1}-01-31`);
	} else if (dateNow.getUTCMonth() === 2) {
		endLastYearThisMonth = new Date(`${dateNow.getUTCFullYear() - 1}-02-28`);
	} else if (monthsWith30Days.includes(dateNow.getUTCMonth())) {
		endLastYearThisMonth = new Date(`${dateNow.getUTCFullYear() - 1}-${dateNow.getUTCMonth()}-30`);
	} else if (monthsWith31Days.includes(dateNow.getUTCMonth())) {
		endLastYearThisMonth = new Date(`${dateNow.getUTCFullYear() - 1}-${dateNow.getUTCMonth()}-31`);
	}

	dateNow.setUTCHours(0, 0, 0, 0);
	beginningLastYearThisMonth.setUTCHours(0, 0, 0, 0);
	endLastYearThisMonth.setUTCHours(0, 0, 0, 0);

	let sortedDeals = deals.filter(record => {
		let date = new Date(record.Created_Time.substring(0, 10));
		if (date >= beginningLastYearThisMonth && date <= endLastYearThisMonth && record.Owner.name === name) {
			return record;
		}
	});

	let salesWon = deals.filter(record => {
		let date = new Date(record.Closing_Date);

		if (
			date >= beginningLastYearThisMonth &&
			date <= endLastYearThisMonth &&
			record.Stage === "Closed Won" &&
			record.Owner.name === name
		) {
			return record;
		}
	});

	let sortedSets = sets.filter(record => {
		let date = new Date(record.Created_Time.substring(0, 10));
		if (date >= beginningLastYearThisMonth && date <= endLastYearThisMonth && record.Owner.name === name) {
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

const getLastMonthDealsAndSets = (deals, sets, name) => {
	let dateNow = new Date();
	let beginningLastMonth = new Date(`${dateNow.getUTCFullYear()}-${dateNow.getUTCMonth()}-01`);
	let endLastMonth = new Date();
	let revenueGenerated = 0;
	let averageSale = 0;

	if (dateNow.getUTCMonth() === 0) {
		beginningLastMonth = new Date(`${dateNow.getUTCFullYear() - 1}-12-01`);
		endLastMonth = new Date(`${dateNow.getUTCFullYear() - 1}-12-31`);
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

const getMonthForEmail = async (beginningMonth, endMonth) => {
	let revenueGenerated = 0;
	let averageSale = 0;

	let { deals, sets } = await DB.getSales();

	let sortedDeals = deals.filter(record => {
		let date = new Date(record.Created_Time.substring(0, 10));
		if (date >= beginningMonth && date <= endMonth) {
			return record;
		}
	});

	let salesWon = deals.filter(record => {
		let date = new Date(record.Closing_Date);

		if (date >= beginningMonth && date <= endMonth && record.Stage === "Closed Won") {
			return record;
		}
	});

	let sortedSets = sets.filter(record => {
		let date = new Date(record.Created_Time.substring(0, 10));
		if (date >= beginningMonth && date <= endMonth) {
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

const Email = async (req, res) => {
	let { email, dateRequested } = req.body;
	let beginningMonth = new Date(dateRequested);
	let endMonth = monthsWith31Days.includes(beginningMonth.getUTCMonth() + 1)
		? new Date(`${beginningMonth.getUTCFullYear()}-${beginningMonth.getUTCMonth() + 1}-31`)
		: new Date(`${beginningMonth.getUTCFullYear()}-${beginningMonth.getUTCMonth() + 1}-30`);

	beginningMonth.setUTCHours(0, 0, 0, 0);
	endMonth.setUTCHours(0, 0, 0, 0);

	let { sortedSets, sortedDeals, revenueGenerated, salesWon, averageSale } = await getMonthForEmail(
		beginningMonth,
		endMonth
	);

	let salesWonForProductsSold = salesWon;
	let setsForCustomerSource = sortedSets;

	let monthProductAndCustomerSource = getProductsAndCustomerSource(salesWonForProductsSold, setsForCustomerSource);

	let ProductObject = {};
	let productIndex = 0;
	let SourceObject = {};
	let sourceIndex = 0;
	for (const product in monthProductAndCustomerSource.sortedProductsInvolved[0]) {
		ProductObject[monthProductAndCustomerSource.sortedProductsInvolved[0][productIndex]] =
			monthProductAndCustomerSource.sortedProductsInvolved[1][productIndex];
		productIndex++;
	}

	for (const source in monthProductAndCustomerSource.sortedProjectType[0]) {
		SourceObject[monthProductAndCustomerSource.sortedProjectType[0][sourceIndex]] =
			monthProductAndCustomerSource.sortedProjectType[1][sourceIndex];
		sourceIndex++;
	}

	let excelObject = [
		{
			Date: `${monthNames[beginningMonth.getUTCMonth()]}-${beginningMonth.getUTCFullYear()}`,
			Deals: sortedDeals.length,
			Sets: sortedSets.length,
			Revenue: revenueGenerated,
			Average_Sale: averageSale,
			Sales_Won: salesWon.length,
			"": ""
		},
		ProductObject,
		SourceObject
	];
	// let newWB = xlsx.utils.book_new();
	// let newWS = xlsx.utils.json_to_sheet(excelObject);
	// xlsx.utils.book_append_sheet(newWB, newWS, "Sales");
	// console.log(process.env.EMAIL_NAME);
	// console.log(process.env.EMAIL_PASS);

	// xlsx.writeFile(newWB, `${__dirname}/Sales.xlsx`);
	let transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: "Xapollon430@gmail.com",
			pass: "Anakonda11+"
		}
	});

	let options = {
		from: "Xapollon430@gmail.com",
		to: email,
		subject: "Sales"
		// attachments: { filename: "Sales.xlsx" }
	};

	transporter.sendMail(options, (err, data) => {
		if (err) {
			console.log(err);
		} else {
			data;
		}
	});
};
module.exports = {
	getDesigner,
	getNation,
	getUsers,
	getCompany,
	Login,
	Email
};
