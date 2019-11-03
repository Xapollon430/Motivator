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
			let usersResponse = await fetch("http://localhost:5000/users", {
				headers: {
					"Authorization": `Bearer ?`
				}
			});
			let users = await usersResponse.json();
			updateNations(users.nationsEndPoint);
			updateDesigners(users);
		};
		getUsers();
	}, []);

	const updateCurrentSelectedAndSpinner = event => {
		if (event.target.innerHTML !== currentSelected && event.target.classList.contains("designerName")) {
			updateLoading(true);
			updateCurrentSelected(event.target.innerHTML);
		}
	};

	let navDesigners = null;

	if (designers) {
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
	if (!loggedIn) {
		navDesigners = null;
	}
	return (
		<div className="sideNav" onClick={event => updateCurrentSelectedAndSpinner(event)}>
			{navDesigners}
		</div>
	);
};

export default Users;
