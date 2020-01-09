const sortData = salesInfo => {
	let lastMonthInfo = {
		sortedSets: [],
		sortedDeals: [],
		revenueGenerated: 0,
		salesWon: [],
		averageSale: 0
	};
	let lastYearThisMonth = {
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

	for (let i = 0; i < salesInfo.length; i++) {
		lastMonthInfo.sortedDeals.push(...salesInfo[i].lastMonthInfo.sortedDeals);
		lastMonthInfo.sortedSets.push(...salesInfo[i].lastMonthInfo.sortedSets);
		lastMonthInfo.revenueGenerated += salesInfo[i].lastMonthInfo.revenueGenerated;
		lastMonthInfo.salesWon.push(...salesInfo[i].lastMonthInfo.salesWon);
		lastYearThisMonth.sortedDeals.push(...salesInfo[i].lastYearThisMonth.sortedDeals);
		lastYearThisMonth.sortedSets.push(...salesInfo[i].lastYearThisMonth.sortedSets);
		lastYearThisMonth.revenueGenerated += salesInfo[i].lastYearThisMonth.revenueGenerated;
		lastYearThisMonth.salesWon.push(...salesInfo[i].lastYearThisMonth.salesWon);
		thisMonthInfo.sortedDeals.push(...salesInfo[i].thisMonthInfo.sortedDeals);
		thisMonthInfo.sortedSets.push(...salesInfo[i].thisMonthInfo.sortedSets);
		thisMonthInfo.revenueGenerated += salesInfo[i].thisMonthInfo.revenueGenerated;
		thisMonthInfo.salesWon.push(...salesInfo[i].thisMonthInfo.salesWon);
	}

	lastMonthInfo.averageSale = lastMonthInfo.revenueGenerated / lastMonthInfo.salesWon.length;
	lastYearThisMonth.averageSale = lastYearThisMonth.revenueGenerated / lastYearThisMonth.salesWon.length;
	thisMonthInfo.averageSale = thisMonthInfo.revenueGenerated / thisMonthInfo.salesWon.length;

	return {
		thisMonthInfo,
		lastMonthInfo,
		lastYearThisMonth
	};
};

module.exports = sortData;
