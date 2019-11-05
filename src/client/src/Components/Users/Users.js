import React, { useEffect } from "react";

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
			if (loggedIn) {
				let usersResponse = await fetch("https://ucsdashboard.herokuapp.com/users", {
					headers: {
						"Authorization": `Bearer ${JSON.parse(localStorage.getItem("jwtToken"))}`
					}
				});
				let users = await usersResponse.json();
				console.log(users);
				updateNations(users.nationsEndPoint);
				updateDesigners(users);
			}
		};
		getUsers();
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
		allUsers.push(...designers.nationsEndPoint);
		allUsers.push(...designers.usersEndPoint);
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

export default Users;
