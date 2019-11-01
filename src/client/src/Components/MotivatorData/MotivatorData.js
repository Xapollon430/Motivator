import React, { useEffect } from "react";

let times = ["Last Month", "Last Week", "This Month"];

const MotivatorData = ({ currentSelected, updateSalesData, salesData, nations }) => {
	useEffect(() => {
		const getSales = async () => {
			if (nations.includes(currentSelected)) {
				let salesResponse = await fetch(`http://localhost:5000/nation?name=${currentSelected}`);
				let sales = await salesResponse.json();
				console.log(sales);
				updateSalesData(sales);
			} else {
				let salesResponse = await fetch(`http://localhost:5000/designer?name=${currentSelected}`);
				let sales = await salesResponse.json();

				updateSalesData(sales);
			}
		};
		if (currentSelected) {
			getSales();
		}
	}, [currentSelected]);

	let viewData = <h1>Welcome UCS Tuesday Meeting!</h1>;

	if (salesData) {
		viewData = (
			<div className="motivatorApi">
				{salesData.map((data, index) => {
					return (
						<div key={index} className="dataWrap">
							<h3>{times[index]}</h3>
							<div className="boxWrap">
								<div className="box">
									<h5 className="dataTitle">Sets Created</h5>
									<div className="amount">{data.sortedSets.length}</div>
								</div>
								<div className="box">
									<h5 className="dataTitle">Deals Created</h5>
									<div className="amount">{data.sortedDeals.length}</div>
								</div>
								<div className="box">
									<h5 className="dataTitle">Revenue Generated</h5>
									<div className="amount">${Math.trunc(data.revenueGenerated)}</div>
								</div>
								<div className="box">
									<h5 className="dataTitle">Sales Won</h5>
									<div className="amount">{data.salesWon.length}</div>
								</div>
								<div className="box">
									<h5 className="dataTitle">Average Sale</h5>
									<div className="amount">${Math.trunc(data.averageSale)}</div>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		);
	}

	return viewData;
};

export default MotivatorData;
