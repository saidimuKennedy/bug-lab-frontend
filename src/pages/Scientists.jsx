import React, { useState, useEffect } from "react";
import Modal from "../components/Modal";
import "../styles/Scientists.css";
import useToast from "../hooks/useToast";
import { endpoints } from "../config/api";

function Scientists() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
	});

	const [scientists, setScientists] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
	const [availableBugs, setAvailableBugs] = useState([]);
	const [selectedBugId, setSelectedBugId] = useState("");
	const [currentScientist, setCurrentScientist] = useState(null);

	const { toast, showToast } = useToast();

	const [isEditing, setIsEditing] = useState(false);
	const [expandedCards, setExpandedCards] = useState({});

	useEffect(() => {
		fetchScientists();
	}, []);

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const fetchScientists = async () => {
		try {
			const response = await fetch(endpoints.scientists, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});
			if (!response.ok) {
				throw new Error("Failed to fetch scientists");
			}
			const data = await response.json();
			setScientists(data);
			setLoading(false);
		} catch (err) {
			setError("Failed to fetch scientists");
			setLoading(false);
		}
	};

	const validateScientist = (formData) => {
		const errors = [];

		if (formData.name.length < 2) {
			errors.push("Name must be at least 2 characters long");
		}
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			errors.push("Enter a valid email");
		}
		if (!formData.password && !formData.isEditing) {
			errors.push("Password is required");
		} else if (formData.password && formData.password.length < 6) {
			errors.push("Password must be at least 6 characters");
		}

		return errors;
	};

	const handleAddScientist = async (e) => {
		e.preventDefault();

		// check whether all fields are ok
		const errors = validateScientist({ ...formData, isEditing });
		if (errors.length > 0) {
			showToast(errors[0]);
			return;
		}
		// post request
		try {
			await fetch(endpoints.scientists, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});
			setIsModalOpen(false);
			fetchScientists();
		} catch (error) {
			console.error("Error adding scientist: ", error);
		}
	};

	const fetchAvailableBugs = async () => {
		try {
			const response = await fetch(endpoints.bugs);
			const data = await response.json();
			setAvailableBugs(data);
		} catch (error) {
			showToast("Failed get bugs");
		}
	};

	const openAssignModal = (scientist) => {
		setCurrentScientist(scientist);
		fetchAvailableBugs();
		setIsAssignModalOpen(true);
	};

	const handleAssignBug = async (e) => {
		e.preventDefault();

		if (!currentScientist) {
			showToast("No scientist selected");
			return;
		}

		try {
			if (!currentScientist.id || !selectedBugId) {
				throw new Error("Missing scientist ID or bug ID");
			}

			const response = await fetch(
				`${endpoints.scientists}/${currentScientist.id}/assign`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ bug_id: selectedBugId }),
				}
			);

			const data = await response.json();

			if (!response.ok) {
				if (response.status === 409) {
					throw new Error("This bug is already assigned to this scientist");
				}
				throw new Error(data.error || "Failed to assign bug");
			}

			await fetchScientists(); // Wait for the fetch to complete
			setIsAssignModalOpen(false);
			setSelectedBugId("");
			showToast("Bug assigned successfully!");
		} catch (error) {
			console.error("Error assigning bug: ", error);
			showToast(error.message || "Error assigning bug");
		}
	};

	const handleDeleteScientist = async (id) => {
		const scientistToDelete = scientists.find(
			(scientist) => scientist.id === id
		);
		if (!scientistToDelete) {
			throw new Error("Scientist not found");
		}
		if (
			!window.confirm(
				`Are you sure you want to kick ${scientistToDelete.name} out of the team?`
			)
		)
			return;

		try {
			const response = await fetch(`${endpoints.scientists}/${id}/delete`, {
				method: "DELETE",
			});
			if (!response.ok) {
				throw new Error("Delete failed");
			}
			setScientists((prevScientist) =>
				prevScientist.filter((scientist) => scientist.id !== id)
			);
			showToast("Scientist deleted! 🗑️");
		} catch (error) {
			console.error(`Error deleting ${scientistToDelete.name}`, error);
			showToast(`Error deleting ${scientistToDelete.name}`);
		}
	};

	const handleUnassignBug = async (scientistId, bugId) => {
		const scientist = scientists.find((sci) => sci.id === scientistId);
		if (!scientist) {
			showToast("Scientist not found");
			return;
		}

		if (!window.confirm("Are you sure you want to unassign this bug?")) {
			return;
		}

		try {
			const response = await fetch(
				`${endpoints.scientists}/${scientistId}/unassign`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ bug_id: bugId }),
				}
			);

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || "Failed to unassign bug");
			}

			await fetchScientists();
			showToast("Bug unassigned successfully!");
		} catch (error) {
			console.error("Error unassigning bug: ", error);
			showToast(error.message || "Error unassigning bug");
		}
	};

	const handleEditClick = (scientist) => {
		if (!scientist) {
			showToast("Error: Scientist not found");
			return;
		}

		setFormData({
			name: scientist.name || "",
			email: scientist.email || "",
			password: "",
		});

		setCurrentScientist(scientist);
		setIsEditing(true);
		setIsModalOpen(true);
	};

	const handleEditScientist = async (e) => {
		e.preventDefault();

		// check whether all fields are ok
		const errors = validateScientist({ ...formData, isEditing });
		if (errors.length > 0) {
			showToast(errors[0]);
			return;
		}

		try {
			const response = await fetch(
				`${endpoints.scientists}/${currentScientist.id}`,
				{
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(formData),
				}
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to update scientist");
			}

			setIsModalOpen(false);
			setIsEditing(false);
			setFormData({ name: "", email: "", password: "" });
			await fetchScientists();
			showToast("Scientist updated successfully!");
		} catch (error) {
			console.error("Update failed:", error);
			showToast(error.message || "Error updating scientist");
		}
	};

	const toggleCardExpansion = (scientistId) => {
		setExpandedCards((prev) => ({
			...prev,
			[scientistId]: !prev[scientistId],
		}));
	};

	const getBugCountBadge = (scientist) => {
		const bugCount = Array.isArray(scientist.bugs)
			? scientist.bugs.filter((bug) => bug !== null).length
			: 0;

		let badgeClass = "bug-count-badge";
		if (bugCount > 3) badgeClass += " high";
		else if (bugCount > 0) badgeClass += " active";

		return <span className={badgeClass}>{bugCount}</span>;
	};

	if (loading) return <div className="loading">Loading scientists...</div>;
	if (error) return <div className="error">{error}</div>;

	return (
		<div className="scientists-page">
			<h1>Research Team</h1>
			{toast && <div className="toast">{toast}</div>}
			<div className="scientists-grid">
				{scientists.map((scientist) => (
					<div key={scientist.id} className="scientist-card">
						<div className="card-header">
							<div className="scientist-avatar">
								{scientist.name.charAt(0).toUpperCase()}
							</div>
							<div className="scientist-info">
								<div className="scientist-name-row">
									<h3>{scientist.name}</h3>
									<div className="header-actions">
										<button
											className="edit-btn"
											onClick={() => handleEditClick(scientist)}
											title="Edit Scientist"
										>
											✏️
										</button>
										<button
											className="delete-btn"
											onClick={() => handleDeleteScientist(scientist.id)}
											title="Delete Scientist"
										>
											🗑️
										</button>
									</div>
								</div>
								<p className="scientist-email">{scientist.email}</p>
							</div>
						</div>

						<div className="card-body">
							<div className="bug-status-bar">
								<span className="bug-status-label">Assigned Bugs</span>
								{getBugCountBadge(scientist)}
							</div>

							{Array.isArray(scientist.bugs) &&
								scientist.bugs.filter((bug) => bug !== null).length > 0 && (
									<div
										className={`bug-preview ${
											expandedCards[scientist.id] ? "expanded" : ""
										}`}
									>
										<div
											className="bug-preview-header"
											onClick={() => toggleCardExpansion(scientist.id)}
										>
											<span>View Assigned Bugs</span>
											<span className="expand-icon">
												{expandedCards[scientist.id] ? "▼" : "▶"}
											</span>
										</div>

										{expandedCards[scientist.id] && (
											<div className="assigned-bug-list">
												<ul>
													{scientist.bugs
														.filter((bug) => bug !== null)
														.map((bug) => (
															<li key={bug.id} className="bug-item">
																<div className="bug-details">
																	<span className="bug-name">{bug.name}</span>
																	<span className="bug-type">{bug.type}</span>
																</div>
																<div className="bug-item-actions">
																	<span className="bug-strength">
																		Strength: {bug.strength || "N/A"}
																	</span>
																	<button
																		className="unassign-bug-btn"
																		onClick={(e) => {
																			e.stopPropagation(); // Prevent toggling the card
																			handleUnassignBug(scientist.id, bug.id);
																		}}
																		title="Unassign Bug"
																	>
																		🗑️
																	</button>
																</div>
															</li>
														))}
												</ul>
											</div>
										)}
									</div>
								)}
						</div>

						<div className="card-actions">
							<button
								className="assign-bug-btn"
								onClick={() => openAssignModal(scientist)}
							>
								Assign Bug
							</button>
						</div>
					</div>
				))}
			</div>
			<button
				className="add-scientist-btn"
				onClick={() => {
					setIsEditing(false);
					setFormData({ name: "", email: "", password: "" });
					setIsModalOpen(true);
				}}
				title="Add New Scientist"
			>
				+
			</button>
			<Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
				<h2>{isEditing ? "Edit Scientist" : "Add New Scientist"}</h2>
				<form onSubmit={isEditing ? handleEditScientist : handleAddScientist}>
					<input
						type="text"
						name="name"
						placeholder="Name"
						value={formData.name}
						onChange={handleInputChange}
						required
					/>
					<input
						type="email"
						name="email"
						placeholder="Email"
						value={formData.email}
						onChange={handleInputChange}
						required
					/>
					<input
						type="password"
						name="password"
						placeholder="Password"
						value={formData.password}
						onChange={handleInputChange}
						required={!isEditing}
					/>
					<button type="submit">
						{isEditing ? "Update Scientist" : "Add Scientist"}
					</button>
				</form>
			</Modal>
			<Modal
				isOpen={isAssignModalOpen}
				onClose={() => setIsAssignModalOpen(false)}
			>
				<h2>Assign Bug to {currentScientist?.name}</h2>
				<form onSubmit={handleAssignBug}>
					<select
						value={selectedBugId}
						onChange={(e) => setSelectedBugId(e.target.value)}
						required
					>
						<option value="">Select a bug</option>
						{availableBugs.map((bug) => (
							<option key={bug.id} value={bug.id}>
								{bug.name} - Strength: {bug.strength}
							</option>
						))}
					</select>
					<button type="submit">Assign Bug</button>
				</form>
			</Modal>
		</div>
	);
}

export default Scientists;
