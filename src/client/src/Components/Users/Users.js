import React, { useEffect } from "react";
import { updateDesigners, updateCurrentSelected, updateNations, updateLoading } from "../../Store/actions";
import { connect } from "react-redux";
let dateNow = new Date();

const Users = ({
	designers,
	currentSelected,
	updateDesigners,
	updateCurrentSelected,
	updateNations,
	updateLoading,
	loggedIn
}) => {
	useEffect(() => {
		const getUsers = async () => {
			let usersResponse = await fetch(`http://localhost:5000/users`, {
				headers: {
					"Authorization": `Bearer ${JSON.parse(localStorage.getItem("jwtToken"))}`
				}
			});
			let users = await usersResponse.json();
			updateNations(users.nationsEndPoint);
			updateDesigners(users);
		};
		if (loggedIn) {
			getUsers();
		}
	}, [loggedIn]);

	const updateCurrentSelectedAndSpinner = event => {
		if (event.target.innerHTML !== currentSelected && event.target.classList.contains("designerName")) {
			updateLoading(true);
			updateCurrentSelected(event.target.innerHTML);
		}
	};

	let navDesigners = null;

	if (!loggedIn) {
		navDesigners = null;
	} else if (designers) {
		let allUsers = [];
		/* https://stackoverflow.com/questions/6712034/sort-array-by-firstname-alphabetically-in-javascript	*/
		let designersSorted = designers.usersEndPoint.sort(function(a, b) {
			if (a < b) {
				return -1;
			}
			if (a > b) {
				return 1;
			}
			return 0;
		});
		allUsers.push(...designers.nationsEndPoint);
		allUsers.push(...designersSorted);
		navDesigners = allUsers.map((designer, index) => {
			return designer === currentSelected ? (
				<div key={index} className="designerName currentDesigner">
					{designer}
				</div>
			) : (
				<div key={index} className="designerName">
					{designer}
				</div>
			);
		});
	}
	return (
		<div className="sideNav" onClick={event => updateCurrentSelectedAndSpinner(event)}>
			{navDesigners}
		</div>
	);
};
const mapStateToProps = state => {
	return {
		currentSelected: state.currentSelected,
		loggedIn: state.loggedIn,
		designers: state.designers
	};
};

const mapDispatchToProps = dispatch => {
	return {
		updateCurrentSelected: selected => {
			dispatch(updateCurrentSelected(selected));
		},
		updateNations: nations => {
			dispatch(updateNations(nations));
		},
		updateDesigners: designers => {
			dispatch(updateDesigners(designers));
		},
		updateLoading: bool => {
			dispatch(updateLoading(bool));
		}
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(Users);
