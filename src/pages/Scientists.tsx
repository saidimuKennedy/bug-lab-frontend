import React, {
  useState,
  useEffect,
  type ChangeEvent,
  type FormEvent,
} from "react";
import Modal from "../components/Modal";
import "../styles/Scientists.css";
import useToast from "../hooks/useToast";
import { endpoints } from "../config/api";

interface Bug {
  id: string;
  name: string;
  strength: number;
  type: string;
}

interface Scientist {
  id: string;
  name: string;
  email: string;
  bugs: Bug[] | null | undefined;
}

interface ScientistFormData {
  name: string;
  email: string;
  password: string;
  isEditing?: boolean;
}

const Scientists: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<ScientistFormData>({
    name: "",
    email: "",
    password: "",
  });

  const [scientists, setScientists] = useState<Scientist[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [availableBugs, setAvailableBugs] = useState<Bug[]>([]);
  const [selectedBugId, setSelectedBugId] = useState<string>("");
  const [currentScientist, setCurrentScientist] = useState<Scientist | null>(
    null
  );

  const { toast, showToast } = useToast();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>(
    {}
  );

  useEffect(() => {
    fetchScientists();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const fetchScientists = async (): Promise<void> => {
    try {
      const response = await fetch(endpoints.scientists, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(
          `HTTP error! status: ${response.status} - ${response.statusText}`
        );
      }
      const data: Scientist[] = await response.json();
      setScientists(data);
      setLoading(false);
      setError(null);
    } catch (err: unknown) {
      console.error("Failed to fetch scientists:", err);
      let errorMessage = "Failed to fetch scientists";
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }
      setError(errorMessage);
      setLoading(false);
    }
  };

  const validateScientist = (
    data: ScientistFormData,
    isEditing: boolean = false
  ): string[] => {
    const errors: string[] = [];
    const name = data.name?.trim();
    const email = data.email?.trim();
    const password = data.password?.trim();

    if (!name || name.length < 2) {
      errors.push("Name must be at least 2 characters long");
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push("Enter a valid email");
    }
    if (!isEditing && (!password || password.length < 6)) {
      errors.push("Password is required and must be at least 6 characters");
    } else if (isEditing && password && password.length < 6) {
      errors.push("Password must be at least 6 characters if provided");
    }

    return errors;
  };

  const handleAddScientist = async (
    e: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    const errors = validateScientist(formData, false);
    if (errors.length > 0) {
      showToast(errors[0]);
      return;
    }

    try {
      const scientistDataToSend = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      };

      const response = await fetch(endpoints.scientists, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scientistDataToSend),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status} - ${response.statusText}, body: ${errorBody}`
        );
      }

      showToast("Scientist added!");
      setIsModalOpen(false);
      setFormData({ name: "", email: "", password: "" });
      await fetchScientists();
    } catch (error: unknown) {
      console.error("Error adding scientist: ", error);
      let errorMessage = "Failed to add scientist";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      showToast(`Failed to add scientist: ${errorMessage}`);
    }
  };

  const fetchAvailableBugs = async (): Promise<void> => {
    try {
      const response = await fetch(endpoints.bugs, {});
      if (!response.ok) {
        throw new Error(
          `Failed to fetch bugs: ${response.status} - ${response.statusText}`
        );
      }
      const data: Bug[] = await response.json();
      setAvailableBugs(data);
    } catch (error: unknown) {
      console.error("Failed to fetch available bugs:", error);
      showToast("Failed to get available bugs");
    }
  };

  const openAssignModal = (scientist: Scientist): void => {
    setCurrentScientist(scientist);
    fetchAvailableBugs();
    setIsAssignModalOpen(true);
  };

  const handleAssignBug = async (
    e: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    if (!currentScientist) {
      showToast("No scientist selected");
      return;
    }
    if (!selectedBugId) {
      showToast("No bug selected");
      return;
    }

    try {
      const response = await fetch(
        `${endpoints.scientists}/${currentScientist.id}/assign`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bug_id: selectedBugId }),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error("This bug is already assigned to this scientist");
        }
        throw new Error(
          responseData.error || `Failed to assign bug: ${response.statusText}`
        );
      }

      await fetchScientists();
      setIsAssignModalOpen(false);
      setSelectedBugId("");
      setCurrentScientist(null);
      showToast("Bug assigned successfully!");
    } catch (error: unknown) {
      console.error("Error assigning bug: ", error);
      let errorMessage = "Error assigning bug";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      showToast(errorMessage);
    }
  };

  const handleDeleteScientist = async (id: string): Promise<void> => {
    if (!id) {
      console.error("Attempted to delete scientist without an ID.");
      showToast("Could not delete scientist: Missing ID.");
      return;
    }

    const scientistToDelete = scientists.find(
      (scientist) => scientist.id === id
    );
    if (!scientistToDelete) {
      console.error(`Scientist with ID ${id} not found in state.`);
      showToast("Scientist not found in list.");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to kick ${
          scientistToDelete.name || "this scientist"
        } out of the team?`
      )
    )
      return;

    try {
      const response = await fetch(`${endpoints.scientists}/${id}/delete`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `Delete failed: ${response.status} - ${response.statusText}, body: ${errorBody}`
        );
      }

      setScientists((prevScientists) =>
        prevScientists.filter((scientist) => scientist.id !== id)
      );
      showToast("Scientist deleted! 🗑️");
    } catch (error: unknown) {
      console.error(
        `Error deleting ${scientistToDelete.name || "scientist"}`,
        error
      );
      let errorMessage = `Error deleting ${
        scientistToDelete.name || "scientist"
      }`;
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      showToast(errorMessage);
    }
  };

  const handleUnassignBug = async (
    scientistId: string,
    bugId: string
  ): Promise<void> => {
    if (!scientistId || !bugId) {
      console.error("Attempted to unassign bug with missing IDs.");
      showToast("Could not unassign bug: Missing IDs.");
      return;
    }

    const scientist = scientists.find((sci) => sci.id === scientistId);
    if (!scientist) {
      showToast("Scientist not found in list.");
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
        throw new Error(
          data.error || `Failed to unassign bug: ${response.statusText}`
        );
      }

      await fetchScientists();
      showToast("Bug unassigned successfully!");
    } catch (error: unknown) {
      console.error("Error unassigning bug: ", error);
      let errorMessage = "Error unassigning bug";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      showToast(errorMessage);
    }
  };

  const handleEditClick = (scientist: Scientist): void => {
    setFormData({
      name: scientist.name || "",
      email: scientist.email || "",
      password: "",
    });

    setCurrentScientist(scientist);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleEditScientist = async (
    e: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    if (!currentScientist) {
      showToast("No scientist selected for update!");
      return;
    }

    const errors = validateScientist(formData, true);
    if (errors.length > 0) {
      showToast(errors[0]);
      return;
    }

    try {
      const scientistDataToSend = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      };

      const response = await fetch(
        `${endpoints.scientists}/${currentScientist.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(scientistDataToSend),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            `Failed to update scientist: ${response.status} - ${response.statusText}`
        );
      }

      showToast("Scientist updated successfully!");
      setIsModalOpen(false);
      setIsEditing(false);
      setFormData({ name: "", email: "", password: "" });
      setCurrentScientist(null);
      await fetchScientists();
    } catch (error: unknown) {
      let errorMessage = "Failed to update scientist";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      console.error("Update failed:", error);
      showToast(errorMessage);
    }
  };

  const toggleCardExpansion = (scientistId: string): void => {
    setExpandedCards((prev) => ({
      ...prev,
      [scientistId]: !prev[scientistId],
    }));
  };

  const getBugCountBadge = (scientist: Scientist): React.ReactElement => {
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
                {scientist.name ? scientist.name.charAt(0).toUpperCase() : "?"}
              </div>
              <div className="scientist-info">
                <div className="scientist-name-row">
                  <h3>{scientist.name || "N/A"}</h3>
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

                <p className="scientist-email">{scientist.email || "N/A"}</p>
              </div>
            </div>

            <div className="card-body">
              <div className="bug-status-bar">
                <span className="bug-status-label">Assigned Bugs</span>

                {getBugCountBadge(scientist)}
              </div>

              {scientist.bugs &&
                Array.isArray(scientist.bugs) &&
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
                                    Strength: {bug.strength ?? "N/A"}{" "}
                                  </span>
                                  <button
                                    className="unassign-bug-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
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
          setCurrentScientist(null);
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
            placeholder={isEditing ? "Leave blank to keep current" : "Password"}
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
        <h2>Assign Bug to {currentScientist?.name ?? "N/A"}</h2>
        <form onSubmit={handleAssignBug}>
          <select
            value={selectedBugId}
            onChange={(e) => setSelectedBugId(e.target.value)}
            required
          >
            <option value="">Select a bug</option>
            {availableBugs.map((bug) => (
              <option key={bug.id} value={bug.id}>
                {bug.name || "Unknown Bug"} - Strength: {bug.strength ?? "N/A"}
              </option>
            ))}
          </select>
          <button type="submit">Assign Bug</button>
        </form>
      </Modal>
    </div>
  );
};

export default Scientists;
