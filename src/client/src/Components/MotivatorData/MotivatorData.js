import React, { useEffect } from "react";
import Spinner from "../../public/spinner.gif";
import Logo from "../../public/logo.png";

let times = ["Last Month", "Last Week", "This Month"];

const MotivatorData = ({
	updateLogin,
	currentSelected,
	updateSalesData,
	salesData,
	nations,
	loading,
	updateLoading,
	loginFail,
	loginFailUpdate,
	loggedIn
}) => {
	let loginError = null;
	let viewData = null;

	useEffect(() => {
		const getSales = async () => {
			if (nations.includes(currentSelected)) {
				let salesResponse = await fetch(`/nation?name=${currentSelected}`, {
					headers: {
						"Authorization": `Bearer ${JSON.parse(localStorage.getItem("jwtToken"))}`
					}
				});
				let sales = await salesResponse.json();
				updateSalesData(sales);
			} else {
				let salesResponse = await fetch(`/designer?name=${currentSelected}`, {
					headers: {
						"Authorization": `Bearer ${JSON.parse(localStorage.getItem("jwtToken"))}`
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
		let username = document.querySelector(".username").value;
		let password = document.querySelector(".password").value;
		let data = JSON.stringify({
			username,
			password
		});
		let tokenResponse = await fetch("/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			mode: "cors",
			body: data
		});
		if (tokenResponse.status === 400) {
			loginFailUpdate(true);
		} else {
			let token = await tokenResponse.json();
			let localStorageToken = JSON.stringify(token.token);
			localStorage.setItem("jwtToken", localStorageToken);
			updateLogin(true);
			loginFailUpdate(true);
		}
	};

	if (loginFail) {
		loginError = (
			<div className="alert alert-danger mt-2 error" role="alert">
				Wrong username or password!
			</div>
		);
	}

	if (!loggedIn) {
		viewData = (
			<form className="loginForm" onSubmit={e => handleSubmit(e)}>
				<h1>Welcome UCS Tuesday Meeting!</h1>
				<div className="form-group">
					<input type="text" className="form-control username" placeholder="Username" />
				</div>
				<div className="form-group">
					<input type="password" className="form-control password" placeholder="Password" />
				</div>
				{loginError}
				<button type="submit" className="btn btn-primary">
					Submit
				</button>
			</form>
		);
	} else if (loading) {
		viewData = <img className="spinner" src={Spinner} />;
	} else if (salesData) {
		viewData = (
			<div className="motivatorApi mt-3">
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
									<div className="amount">${Math.trunc(data.revenueGenerated).toLocaleString()}</div>
								</div>
								<div className="box">
									<h5 className="dataTitle">Sales Won</h5>
									<div className="amount">{data.salesWon.length}</div>
								</div>
								<div className="box">
									<h5 className="dataTitle">Average Sale</h5>
									<div className="amount">${Math.trunc(data.averageSale).toLocaleString()}</div>
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
