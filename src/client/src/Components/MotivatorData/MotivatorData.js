import React, { useEffect } from "react";
import Spinner from "../../public/spinner.gif";
import Logo from "../../public/logo.png";
import { connect } from "react-redux";
import {
	updateLoggedIn,
	updateSalesData,
	updateLoading,
	updateLoginFail,
	updateWeeklyProductAndCustomerSource
} from "../../Store/actions";
let times = ["This Month", "Last Month", "Last Week"];
let URL = process.env.REACT_APP_ENDPOINT;
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
	weeklyProductAndCustomerSource
}) => {
	let loginError = null;
	let viewData = null;

	useEffect(() => {
		const getSales = async () => {
			if (currentSelected === "Company") {
				let salesResponse = await fetch(`${URL}/company`, {
					headers: {
						"Authorization": `Bearer ${JSON.parse(localStorage.getItem("jwtToken"))}`
					}
				});
				let salesJson = await salesResponse.json();

				let weeklyProductAndCustomerSource = salesJson.splice(3, 1);

				updateWeeklyProductAndCustomerSource(weeklyProductAndCustomerSource);
				updateSalesData(salesJson);
			} else if (nations.includes(currentSelected)) {
				let salesResponse = await fetch(`${URL}/nation?name=${currentSelected}`, {
					headers: {
						"Authorization": `Bearer ${JSON.parse(localStorage.getItem("jwtToken"))}`
					}
				});
				let salesJson = await salesResponse.json();

				let weeklyProductAndCustomerSource = salesJson.splice(3, 1);

				updateWeeklyProductAndCustomerSource(weeklyProductAndCustomerSource);
				updateSalesData(salesJson);
			} else {
				let salesResponse = await fetch(`${URL}/designer?name=${currentSelected}`, {
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

	const handleSubmit = async event => {
		event.preventDefault();
		let username = document.querySelector(".username").value;
		let password = document.querySelector(".password").value;
		let data = JSON.stringify({
			username,
			password
		});
		let tokenResponse = await fetch(`${URL}/login`, {
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
		let productsInvolved = weeklyProductAndCustomerSource[0].sortedProductsInvolved;
		let customerSource = weeklyProductAndCustomerSource[0].sortedProjectType;
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

const MapStateToProps = state => {
	return {
		currentSelected: state.currentSelected,
		salesData: state.salesData,
		nations: state.nations,
		loading: state.loading,
		loginFail: state.loginFail,
		loggedIn: state.loggedIn,
		weeklyProductAndCustomerSource: state.weeklyProductAndCustomerSource
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
		updateWeeklyProductAndCustomerSource: data => dispatch(updateWeeklyProductAndCustomerSource(data))
	};
};

export default connect(MapStateToProps, MapDispatchToProps)(MotivatorData);
