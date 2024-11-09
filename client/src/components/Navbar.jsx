import { useState } from "react";
import { Link } from "react-router-dom";

import "./Navbar.css";
import logo from "../assets/logo/RHYTHPIC_LOGO_SMALL.png";

function Navbar() {
	const [inputValue, setInputValue] = useState("");

	const handleChange = (event) => {
		setInputValue(event.target.value);
	};

	return (
		<nav className="navbar">
			<Link to="/" className="logolink">
				<img className="logo" src={logo} alt={"RhythPic logo"}></img>
				<h2 className="logotext">RhythPic</h2>
			</Link>
			<div className="searchandicon">
				<svg
					className="searchicon"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={1.5}
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
					/>
				</svg>
				<input
					className="search"
					type="text"
					id="inputField"
					value={inputValue}
					onChange={handleChange}
					placeholder="Search your Favourite song..."
				/>
			</div>

			<ul className="nav-links">
				<li>
					<a to="/favourites">
						<svg
							className="favouritesicon"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
						</svg>
					</a>
				</li>
				<li>
					<a to="/user">
						<svg
							className="usericon"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<path
								fillRule="evenodd"
								d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
								clipRule="evenodd"
							/>
						</svg>
					</a>
				</li>
			</ul>
		</nav>
	);
}

export default Navbar;
