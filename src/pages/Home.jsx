import React from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css";
import useToast from "../hooks/useToast";
import ladybugImage from "../assets/bug.png"

function Home() {
	const { showToast } = useToast();

	const handleCardClick = (destination) => {
		showToast(`Navigating to ${destination}...`);
	};

	return (
		<div className="home">
			<div className="hero-section">
				<div className="hero-content">
					<h1 className="hero-title">
						Welcome to <span className="highlight">Bug Lab</span>
					</h1>
					<p className="hero-subtitle">
						Your central hub for bug management and scientific research
					</p>
					<div className="hero-buttons">
						<Link to="/bugs" className="hero-button primary">
							Explore Bugs
						</Link>
						<Link to="/scientists" className="hero-button secondary">
							Meet Scientists
						</Link>
					</div>
				</div>
				<div className="hero-image">
					<div className="bg-circle"></div>
					<img
						src={ladybugImage}
						alt="Friendly ladybug"
						className="ladybug-image"
					/>
				</div>
			</div>

			<div className="features-section">
				<h2 className="section-title">What We Offer</h2>
				<div className="home-cards">
					<Link
						to="/bugs"
						className="card"
						onClick={() => handleCardClick("Bugs Collection")}
					>
						<div className="card-icon">🔍</div>
						<h2>Bugs Collection</h2>
						<p>
							View and manage your extensive bug database with advanced
							filtering and tagging
						</p>
						<div className="card-footer">
							<span className="card-action">View Database →</span>
						</div>
					</Link>

					<Link
						to="/scientists"
						className="card"
						onClick={() => handleCardClick("Research Team")}
					>
						<div className="card-icon">👩‍🔬</div>
						<h2>Research Team</h2>
						<p>
							Coordinate with our expert scientists and manage research
							assignments
						</p>
						<div className="card-footer">
							<span className="card-action">Meet the Team →</span>
						</div>
					</Link>

					<div className="card">
						<div className="card-icon">📊</div>
						<h2>Analytics</h2>
						<p>
							Access detailed insights and reports on bug research and
							collection data
						</p>
						<div className="card-footer">
							<span className="card-action">Coming Soon</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Home;
