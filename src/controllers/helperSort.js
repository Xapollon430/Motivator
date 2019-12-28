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

	for (let i = 0; i < salesInfo.length; i++) {
		lastMonthInfo.sortedDeals.push(...salesInfo[i].lastMonthInfo.sortedDeals);
		lastMonthInfo.sortedSets.push(...salesInfo[i].lastMonthInfo.sortedSets);
		lastMonthInfo.revenueGenerated += salesInfo[i].lastMonthInfo.revenueGenerated;
		lastMonthInfo.salesWon.push(...salesInfo[i].lastMonthInfo.salesWon);
		lastWeekInfo.sortedDeals.push(...salesInfo[i].lastWeekInfo.sortedDeals);
		lastWeekInfo.sortedSets.push(...salesInfo[i].lastWeekInfo.sortedSets);
		lastWeekInfo.revenueGenerated += salesInfo[i].lastWeekInfo.revenueGenerated;
		lastWeekInfo.salesWon.push(...salesInfo[i].lastWeekInfo.salesWon);
		thisMonthInfo.sortedDeals.push(...salesInfo[i].thisMonthInfo.sortedDeals);
		thisMonthInfo.sortedSets.push(...salesInfo[i].thisMonthInfo.sortedSets);
		thisMonthInfo.revenueGenerated += salesInfo[i].thisMonthInfo.revenueGenerated;
		thisMonthInfo.salesWon.push(...salesInfo[i].thisMonthInfo.salesWon);
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
