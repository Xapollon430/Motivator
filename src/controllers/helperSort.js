const sortData = salesInfo => {
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

	return {
		thisMonthInfo,
		lastMonthInfo,
		lastWeekInfo
	};
};

module.exports = sortData;
