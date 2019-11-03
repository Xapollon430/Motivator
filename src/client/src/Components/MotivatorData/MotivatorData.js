import React, { useEffect } from "react";
import Spinner from "../../public/spinner.gif";
import Logo from "../../public/logo.png";

let times = ["Last Month", "Last Week", "This Month"];

const MotivatorData = ({ currentSelected, updateSalesData, salesData, nations, loading, updateLoading }) => {
	useEffect(() => {
		const getSales = async () => {
			if (nations.includes(currentSelected)) {
				let salesResponse = await fetch(`http://localhost:5000/nation?name=${currentSelected}`, {
					headers: {
						"Authorization": `Bearer ?`
					}
				});
				let sales = await salesResponse.json();
				updateSalesData(sales);
			} else {
				let salesResponse = await fetch(`http://localhost:5000/designer?name=${currentSelected}`, {
					headers: {
						"Authorization": `Bearer ?`
					}
				});
				let sales = await salesResponse.json();

				updateSalesData(sales);
			}
			updateLoading(false);
		};
		if (currentSelected) {
			getSales();
		}
	}, [currentSelected]);

	const handleSubmit = async event => {
		event.preventDefault();
		console.log(21);
		let formData = new FormData(event.target);
		let tokenResponse = await fetch("http://localhost:5000/login", {
			method: "POST",
			body: formData
		});
		if(tokenResponse.status === 400){
			let token = await tokenResponse.json();
			// localStorage.setItem("jwtToken", token);
		}
		else
	};

	let viewData = (
		<form className="loginForm" onSubmit={e => handleSubmit(e)}>
			<h1>Welcome USC Tuesday Meeting!</h1>
			<div className="form-group">
				<input type="text" className="form-control" placeholder="Username" />
			</div>
			<div className="form-group">
				<input type="password" className="form-control" placeholder="Password" />
			</div>
			<button type="submit" className="btn btn-primary">
				Submit
			</button>
		</form>
	);

	if (loading) {
		viewData = <img className="spinner" src={Spinner} />;
	} else if (salesData) {
		viewData = (
			<div className="motivatorApi">
				<img src={Logo} alt="Image"></img>
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
