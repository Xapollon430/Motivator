import React, { useEffect } from "react";
import Spinner from "../../public/spinner.gif";
import Logo from "../../public/logo.png";
import { connect } from "react-redux";
import {
	updateLoggedIn,
	updateSalesData,
	updateLoading,
	updateLoginFail,
	updateLastMonthProductAndCustomerSource,
	updateThisMonthProductAndCustomerSource,
	updateShowSpecificMonth,
	updateSpecificMonth
} from "../../Store/actions";
let times = ["This Month", "Last Year This Month", "Last Month"];
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
	updateLastMonthProductAndCustomerSource,
	updateLoggedIn,
	updateLoginFail,
	lastMonthProductAndCustomerSource,
	updateThisMonthProductAndCustomerSource,
	thisMonthProductAndCustomerSource,
	updateShowSpecificMonth,
	updateSpecificMonth,
	showSpecificMonth,
	specificMonth
}) => {
	let loginError = null;
	let viewData = null;
	useEffect(() => {
		const getSales = async () => {
			if (currentSelected === "Company") {
				updateShowSpecificMonth(false);

				let salesResponse = await fetch(`http://localhost:5000/company`, {
					headers: {
						"Authorization": `Bearer ${JSON.parse(localStorage.getItem("jwtToken"))}`
					}
				});
				let salesJson = await salesResponse.json();

				let lastMonthProductAndCustomerSource = salesJson.splice(3, 1);
				let thisMonthProductAndCustomerSource = salesJson.splice(3, 1);

				updateLastMonthProductAndCustomerSource(lastMonthProductAndCustomerSource);
				updateThisMonthProductAndCustomerSource(thisMonthProductAndCustomerSource);
				updateSalesData(salesJson);
			} else if (nations.includes(currentSelected)) {
				updateShowSpecificMonth(false);

				let salesResponse = await fetch(`http://localhost:5000/nation?name=${currentSelected}`, {
					headers: {
						"Authorization": `Bearer ${JSON.parse(localStorage.getItem("jwtToken"))}`
					}
				});
				let salesJson = await salesResponse.json();

				let lastMonthProductAndCustomerSource = salesJson.splice(3, 1);
				let thisMonthProductAndCustomerSource = salesJson.splice(3, 1);
				updateLastMonthProductAndCustomerSource(lastMonthProductAndCustomerSource);
				updateThisMonthProductAndCustomerSource(thisMonthProductAndCustomerSource);
				updateSalesData(salesJson);
			} else {
				updateShowSpecificMonth(false);

				let salesResponse = await fetch(`http://localhost:5000/designer?name=${currentSelected}`, {
					headers: {
						"Authorization": `Bearer ${JSON.parse(localStorage.getItem("jwtToken"))}`
					}
				});
				let salesJson = await salesResponse.json();

				let lastMonthProductAndCustomerSource = salesJson.splice(3, 1);
				let thisMonthProductAndCustomerSource = salesJson.splice(3, 1);
				updateLastMonthProductAndCustomerSource(lastMonthProductAndCustomerSource);
				updateThisMonthProductAndCustomerSource(thisMonthProductAndCustomerSource);
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
		let year = document.querySelector("#year").value;
		let month = document.querySelector("#month").value;

		let dateRequested = `${year}-${month}-1`;
		let data = JSON.stringify({
			dateRequested
		});
		let specificMonthlyResponse = await fetch(`http://localhost:5000/email`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			mode: "cors",
			body: data
		});

		let monthlyData = await specificMonthlyResponse.json();
		updateSpecificMonth(monthlyData);

		updateShowSpecificMonth(true);
	};

	const handleSubmit = async event => {
		event.preventDefault();
		let username = document.querySelector(".username").value;
		let password = document.querySelector(".password").value;
		let data = JSON.stringify({
			username,
			password
		});
		let tokenResponse = await fetch(`http://localhost:5000/login`, {
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
		let productsInvolved = lastMonthProductAndCustomerSource[0].sortedProductsInvolved;
		let customerSource = lastMonthProductAndCustomerSource[0].sortedProjectType;
		let productsInvolvedView = [];
		let customerSourceView = [];
		let productsInvolved2 = thisMonthProductAndCustomerSource[0].sortedProductsInvolved;
		let customerSource2 = thisMonthProductAndCustomerSource[0].sortedProjectType;
		let productsInvolvedView2 = [];
		let customerSourceView2 = [];

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

		viewData = (
			<div className="my-3">
				<img src={Logo} alt="Image"></img>
				{currentSelected === "Company" && (
					<form className="emailForm" onSubmit={e => handleEmailSubmit(e)}>
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

				<h3>Products Sold This Month</h3>
				<div className="boxWrap">{productsInvolvedView2}</div>
				<h3>Customer Source This Month</h3>
				<div className="boxWrap">{customerSourceView2}</div>
			</div>
		);

		if (showSpecificMonth === true) {
			let monthCustomerSourceView = [];
			let monthProductsInvolvedView = [];
			let customerSource = specificMonth.splice(5, 1)[0];
			let productsInvolved = specificMonth.splice(5, 1)[0];

			let customerSourceKeys = Object.keys(customerSource);
			let productsInvolvedKeys = Object.keys(productsInvolved);

			let key = 0;
			for (let source in customerSource) {
				monthCustomerSourceView.push(
					<div className="box" key={key}>
						<h6 className="dataTitle">{customerSourceKeys[key]}</h6>
						<div className="amount">{customerSource[source]}</div>
					</div>
				);
				key++;
			}
			key = 0;
			for (let product in productsInvolved) {
				monthProductsInvolvedView.push(
					<div className="box" key={key}>
						<h6 className="dataTitle">{productsInvolvedKeys[key]}</h6>
						<div className="amount">{productsInvolved[product]}</div>
					</div>
				);
				key++;
			}

			viewData = (
				<React.Fragment>
					<div className="my-3">
						<img src={Logo} alt="Image"></img>
						{currentSelected === "Company" && (
							<form className="emailForm" onSubmit={e => handleEmailSubmit(e)}>
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
						<div className="boxWrap">
							<div className="box">
								<h6 className="dataTitle">Sets Created</h6>
								<div className="amount">{specificMonth[0].length}</div>
							</div>
							<div className="box">
								<h6 className="dataTitle">Deals Created</h6>
								<div className="amount">{specificMonth[1].length}</div>
							</div>
							<div className="box">
								<h6 className="dataTitle">Revenue Generated</h6>
								<div className="amount">${Math.trunc(specificMonth[2]).toLocaleString()}</div>
							</div>
							<div className="box">
								<h6 className="dataTitle">Sales Won</h6>
								<div className="amount">{specificMonth[3].length}</div>
							</div>
							<div className="box">
								<h6 className="dataTitle">Average Sale</h6>
								<div className="amount">${Math.trunc(specificMonth[4]).toLocaleString()}</div>
							</div>
						</div>
					</div>
					<h3>Customer Source</h3>
					<div className="boxWrap">{monthProductsInvolvedView}</div>
					<h3>Products Sold</h3>
					<div className="boxWrap">{monthCustomerSourceView}</div>
				</React.Fragment>
			);
		}
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
		lastMonthProductAndCustomerSource: state.lastMonthProductAndCustomerSource,
		thisMonthProductAndCustomerSource: state.thisMonthProductAndCustomerSource,
		showSpecificMonth: state.showSpecificMonth,
		specificMonth: state.specificMonth
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
		updateShowSpecificMonth: bool => {
			dispatch(updateShowSpecificMonth(bool));
		},
		updateSpecificMonth: data => {
			dispatch(updateSpecificMonth(data));
		},
		updateLastMonthProductAndCustomerSource: data => dispatch(updateLastMonthProductAndCustomerSource(data)),
		updateThisMonthProductAndCustomerSource: data => dispatch(updateThisMonthProductAndCustomerSource(data))
	};
};

export default connect(MapStateToProps, MapDispatchToProps)(MotivatorData);
