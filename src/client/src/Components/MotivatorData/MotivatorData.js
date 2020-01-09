import React, { useEffect } from "react";
import Spinner from "../../public/spinner.gif";
import Logo from "../../public/logo.png";
import { connect } from "react-redux";
import {
	updateLoggedIn,
	updateSalesData,
	updateLoading,
	updateLoginFail,
	updateWeeklyProductAndCustomerSource,
	updateThisMonthProductAndCustomerSource
} from "../../Store/actions";
let times = ["This Month", "Last Month", "Last Year This Month"];
let dateNow = new Date();

const MotivatorData = ({
	currentSelected,
	updateSalesData,
	salesData,
	nations,
	loading,
	updateLoading,
	loginFail,
	loggedIn,
	updateWeeklyProductAndCustomerSource,
	updateLoggedIn,
	updateLoginFail,
	weeklyProductAndCustomerSource,
	updateThisMonthProductAndCustomerSource,
	thisMonthProductAndCustomerSource
}) => {
	let loginError = null;
	let viewData = null;

	useEffect(() => {
		const getSales = async () => {
			if (currentSelected === "Company") {
				let salesResponse = await fetch(`https://ucsdashboard.herokuapp.com/company`, {
					headers: {
						"Authorization": `Bearer ${JSON.parse(localStorage.getItem("jwtToken"))}`
					}
				});
				let salesJson = await salesResponse.json();

				let weeklyProductAndCustomerSource = salesJson.splice(3, 1);
				let thisMonthProductAndCustomerSource = salesJson.splice(3, 1);

				updateWeeklyProductAndCustomerSource(weeklyProductAndCustomerSource);
				updateThisMonthProductAndCustomerSource(thisMonthProductAndCustomerSource);
				updateSalesData(salesJson);
			} else if (nations.includes(currentSelected)) {
				let salesResponse = await fetch(`https://ucsdashboard.herokuapp.com/nation?name=${currentSelected}`, {
					headers: {
						"Authorization": `Bearer ${JSON.parse(localStorage.getItem("jwtToken"))}`
					}
				});
				let salesJson = await salesResponse.json();

				let weeklyProductAndCustomerSource = salesJson.splice(3, 1);

				updateWeeklyProductAndCustomerSource(weeklyProductAndCustomerSource);
				updateSalesData(salesJson);
			} else {
				let salesResponse = await fetch(`https://ucsdashboard.herokuapp.com/designer?name=${currentSelected}`, {
					headers: {
						"Authorization": `Bearer ${JSON.parse(localStorage.getItem("jwtToken"))}`
					}
				});
				let salesJson = await salesResponse.json();

				let weeklyProductAndCustomerSource = salesJson.splice(3, 1);

				updateWeeklyProductAndCustomerSource(weeklyProductAndCustomerSource);
				updateSalesData(salesJson);
			}
			updateLoading(false);
		};
		if (currentSelected) {
			getSales();
		}
	}, [currentSelected]);

	const handleEmailSubmit = async event => {
		event.preventDefault();
		let email = document.querySelector("#email").value;
		let year = document.querySelector("#year").value;
		let month = document.querySelector("#month").value;

		let dateRequested = `${year}-${month}-1`;
		let data = JSON.stringify({
			dateRequested,
			email
		});
		await fetch(`https://ucsdashboard.herokuapp.com/email`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			mode: "cors",
			body: data
		});
	};

	const handleSubmit = async event => {
		event.preventDefault();
		let username = document.querySelector(".username").value;
		let password = document.querySelector(".password").value;
		let data = JSON.stringify({
			username,
			password
		});
		let tokenResponse = await fetch(`https://ucsdashboard.herokuapp.com/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			mode: "cors",
			body: data
		});
		if (tokenResponse.status === 400) {
			updateLoginFail(true);
		} else {
			let token = await tokenResponse.json();
			let localStorageToken = JSON.stringify(token.token);
			localStorage.setItem("jwtToken", localStorageToken);
			updateLoggedIn(true);
			updateLoginFail(false);
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
				<h1>Welcome to UCS Dashboard!</h1>
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
		let productsInvolved = weeklyProductAndCustomerSource[0].sortedProductsInvolved;
		let customerSource = weeklyProductAndCustomerSource[0].sortedProjectType;
		let productsInvolvedView = [];
		let customerSourceView = [];
		let productsInvolved2;
		let customerSource2;
		let productsInvolvedView2;
		let customerSourceView2;
		if (currentSelected === "Company") {
			productsInvolved2 = thisMonthProductAndCustomerSource[0].sortedProductsInvolved;
			customerSource2 = thisMonthProductAndCustomerSource[0].sortedProjectType;
			productsInvolvedView2 = [];
			customerSourceView2 = [];
		}

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

		if (currentSelected === "Company") {
			for (let i = 0; i < productsInvolved2[0].length; i++) {
				productsInvolvedView2.push(
					<div key={i} className="boxWrap">
						<div className="box">
							<h6 className="dataTitle">{productsInvolved2[0][i]}</h6>
							<div className="amount">{productsInvolved2[1][i]}</div>
						</div>
					</div>
				);
			}

			for (let i = 0; i < customerSource2[0].length; i++) {
				customerSourceView2.push(
					<div key={i} className="box">
						<h6 className="dataTitle">{customerSource2[0][i]}</h6>
						<div className="amount">{customerSource2[1][i]}</div>
					</div>
				);
			}
		}

		viewData = (
			<div className="my-3">
				<img src={Logo} alt="Image"></img>
				{currentSelected === "Company" && (
					<form className="emailForm" onSubmit={e => handleEmailSubmit(e)}>
						<input id="email" placeholder="Email" type="text" />
						<select id="year">
							<option value={dateNow.getUTCFullYear()}>{dateNow.getUTCFullYear()}</option>
							<option value={dateNow.getUTCFullYear() - 1}>{dateNow.getUTCFullYear() - 1}</option>
						</select>
						<select id="month">
							<option value="01">January</option>
							<option value="02">February </option>
							<option value="03">March</option>
							<option value="04">April</option>
							<option value="05">May</option>
							<option value="06">June</option>
							<option value="07">July</option>
							<option value="08">August</option>
							<option value="09">September</option>
							<option value="10">October</option>
							<option value="11">November</option>
							<option value="12">December</option>
						</select>
						<button type="submit" className="btn btn-primary btn-sm">
							Submit
						</button>
					</form>
				)}

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
				<h3>Products Sold Last Month</h3>
				<div className="boxWrap">{productsInvolvedView}</div>
				<h3>Customer Source Last Month</h3>
				<div className="boxWrap">{customerSourceView}</div>
				{currentSelected === "Company" && (
					<React.Fragment>
						<h3>Products Sold This Month</h3>
						<div className="boxWrap">{productsInvolvedView2}</div>
						<h3>Customer Source This Month</h3>
						<div className="boxWrap">{customerSourceView2}</div>
					</React.Fragment>
				)}
			</div>
		);
	}

	return viewData;
};

const MapStateToProps = state => {
	return {
		currentSelected: state.currentSelected,
		salesData: state.salesData,
		nations: state.nations,
		loading: state.loading,
		loginFail: state.loginFail,
		loggedIn: state.loggedIn,
		weeklyProductAndCustomerSource: state.weeklyProductAndCustomerSource,
		thisMonthProductAndCustomerSource: state.thisMonthProductAndCustomerSource
	};
};

const MapDispatchToProps = dispatch => {
	return {
		updateLoggedIn: bool => dispatch(updateLoggedIn(bool)),
		updateSalesData: salesData => {
			dispatch(updateSalesData(salesData));
		},
		updateLoading: bool => dispatch(updateLoading(bool)),
		updateLoginFail: bool => {
			dispatch(updateLoginFail(bool));
		},
		updateWeeklyProductAndCustomerSource: data => dispatch(updateWeeklyProductAndCustomerSource(data)),
		updateThisMonthProductAndCustomerSource: data => dispatch(updateThisMonthProductAndCustomerSource(data))
	};
};

export default connect(MapStateToProps, MapDispatchToProps)(MotivatorData);
