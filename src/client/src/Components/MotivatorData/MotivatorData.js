import React, { useEffect, useState } from "react";
import Spinner from "../../public/spinner.gif";
import { store } from "../../../data/store";
import { getSalesByNation, getSalesByDesigner, useSales, updateSales } from "../../../data/sales/actions";

let times = ["Last Month", "Last Week", "This Month"];


const MotivatorData = ({ currentSelected, updateSalesData, salesData, nations, loading, updateLoading }) => {
	const sales = useSales()
	
	const getSales = () => {
		let myPromise;
		if (nations.includes(currentSelected)) {
			myPromise = getSalesByNation(currentSelected);
		} else {
			myPromise = getSalesByDesigner(currentSelected);
		}
		myPromise
			.then(sales => updateSales(sales))
			.catch(err => console.error(err))
			.then(() => updateLoading(false));
	};

	if (currentSelected) {
		getSales();
	}

	let viewData = <h1>Welcome UCS Tuesday Meeting!</h1>;

	if (loading) {
		viewData = <img className="spinner" src={Spinner} />;
	} else if (salesData) {
		viewData = (
			<div className="motivatorApi">
				{sales.map((data, index) => {
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
