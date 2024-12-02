import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./Navbar.css";
import logo from "../assets/logo/RHYTHPIC_LOGO_SMALL.png";

function Navbar() {
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();

  const handleChange = (event) => {
    setSearchValue(event.target.value);
  };

  useEffect(() => {
    navigate(`/searchresult/${searchValue}`);
  }, [searchValue]);

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
          strokeWidth={3}
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
          value={searchValue}
          onChange={handleChange}
          autoComplete="off"
          placeholder="Search your Favourite song..."
        />
        <svg
          className="cancelicon"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={3}
          stroke="currentColor"
          onClick={() => setSearchValue("")}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18 18 6M6 6l12 12"
          />
        </svg>
      </div>

      <ul className="nav-links">
        <li>
          <Link to="/favourites" className="logolink">
            <svg
              className="favouritesicon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
            </svg>
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
