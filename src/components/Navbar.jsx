import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "../styles/Navbar.css";

function Navbar() {
	const [scrolled, setScrolled] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			const isScrolled = window.scrollY > 20;
			if (isScrolled !== scrolled) {
				setScrolled(isScrolled);
			}
		};

		window.addEventListener("scroll", handleScroll);
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, [scrolled]);

	return (
		<nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
			<div className="navbar-container">
				<NavLink to="/" className="navbar-logo">
					<span className="logo-icon">🐞</span>
					<span className="logo-text">Bug Lab</span>
				</NavLink>

				<div
					className={`mobile-icon ${menuOpen ? "active" : ""}`}
					onClick={() => setMenuOpen(!menuOpen)}
				>
					<span></span>
					<span></span>
					<span></span>
				</div>

				<ul className={`nav-menu ${menuOpen ? "active" : ""}`}>
					<li className="nav-item">
						<NavLink
							to="/"
							className={({ isActive }) =>
								isActive ? "nav-link active" : "nav-link"
							}
							onClick={() => setMenuOpen(false)}
						>
							Home
						</NavLink>
					</li>
					<li className="nav-item">
						<NavLink
							to="/bugs"
							className={({ isActive }) =>
								isActive ? "nav-link active" : "nav-link"
							}
							onClick={() => setMenuOpen(false)}
						>
							Bugs
						</NavLink>
					</li>
					<li className="nav-item">
						<NavLink
							to="/scientists"
							className={({ isActive }) =>
								isActive ? "nav-link active" : "nav-link"
							}
							onClick={() => setMenuOpen(false)}
						>
							Scientists
						</NavLink>
					</li>
				</ul>
			</div>
		</nav>
	);
}

export default Navbar;
