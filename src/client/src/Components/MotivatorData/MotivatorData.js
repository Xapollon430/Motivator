import React, { useEffect } from "react";
import Spinner from "../../public/spinner.gif";
import Logo from "../../public/logo.png";

let times = ["This Month", "Last Month", "Last Week"];
let extraDataTitle = ["Products Involved", "Customer Source"];

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
	loggedIn,
	updateExtraData,
	extraData
}) => {
	let loginError = null;
	let viewData = null;

	useEffect(() => {
		const getSales = async () => {
			if (currentSelected === "Company") {
				let salesResponse = await fetch(`http://localhost:5000/company`, {
					headers: {
						"Authorization": `Bearer ${JSON.parse(localStorage.getItem("jwtToken"))}`
					}
				});
				let salesJson = await salesResponse.json();

				let extraData = salesJson.splice(3, 1);

				updateExtraData(extraData);
				updateSalesData(salesJson);
			} else if (nations.includes(currentSelected)) {
				let salesResponse = await fetch(`http://localhost:5000/nation?name=${currentSelected}`, {
					headers: {
						"Authorization": `Bearer ${JSON.parse(localStorage.getItem("jwtToken"))}`
					}
				});
				let salesJson = await salesResponse.json();

				let extraData = salesJson.splice(3, 1);

				updateExtraData(extraData);
				updateSalesData(salesJson);
			} else {
				let salesResponse = await fetch(`http://localhost:5000/designer?name=${currentSelected}`, {
					headers: {
						"Authorization": `Bearer ${JSON.parse(localStorage.getItem("jwtToken"))}`
					}
				});
				let salesJson = await salesResponse.json();
				let extraData = salesJson.splice(3, 1);

				updateExtraData(extraData);
				updateSalesData(salesJson);
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
		let tokenResponse = await fetch("http://localhost:5000/login", {
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
		let productsInvolved = extraData[0].sortedProductsInvolved;
		let customerSource = extraData[0].sortedProjectType;
		let productsInvolvedView = [];
		let customerSourceView = [];

		for (let i = 0; i < productsInvolved[0].length; i++) {
			productsInvolvedView.push(
				<div key={i} className="boxWrap">
					<div className="box">
						<h6 className="dataTitle">{productsInvolved[0][i]}</h6>
						<div className="amount">{productsInvolved[1][i]}</div>
					</div>
				</div>
			);
		}

		for (let i = 0; i < customerSource[0].length; i++) {
			customerSourceView.push(
				<div key={i} className="box">
					<h6 className="dataTitle">{customerSource[0][i]}</h6>
					<div className="amount">{customerSource[1][i]}</div>
				</div>
			);
		}

		viewData = (
			<div className="my-3">
				<img src={Logo} alt="Image"></img>
				<h1>{currentSelected}</h1>
				{salesData.map((data, index) => {
					return (
						<div key={index}>
							<h3>{times[index]}</h3>
							<div className="boxWrap">
								<div className="box">
									<h6 className="dataTitle">Sets Created</h6>
									<div className="amount">{data.sortedSets.length}</div>
								</div>
								<div className="box">
									<h6 className="dataTitle">Deals Created</h6>
									<div className="amount">{data.sortedDeals.length}</div>
								</div>
								<div className="box">
									<h6 className="dataTitle">Revenue Generated</h6>
									<div className="amount">${Math.trunc(data.revenueGenerated).toLocaleString()}</div>
								</div>
								<div className="box">
									<h6 className="dataTitle">Sales Won</h6>
									<div className="amount">{data.salesWon.length}</div>
								</div>
								<div className="box">
									<h6 className="dataTitle">Average Sale</h6>
									<div className="amount">${Math.trunc(data.averageSale).toLocaleString()}</div>
								</div>
							</div>
						</div>
					);
				})}
				<h3>Products Sold Last Week</h3>
				<div className="boxWrap">{productsInvolvedView}</div>
				<h3>Customer Source Last Week</h3>

				<div className="boxWrap">{customerSourceView}</div>
			</div>
		);
	}
	return viewData;
};

export default MotivatorData;
