import React, {
  useState,
  useEffect,
  type ChangeEvent,
  type FormEvent,
} from "react";
import "../styles/Bugs.css";
import useToast from "../hooks/useToast";
import Modal from "../components/Modal";
import { endpoints } from "../config/api";

interface BugFormData {
  name: string;
  strength: string;
  type: string;
}

interface Bug {
  id: string;
  name: string;
  strength: number;
  type: string;
}

const Bugs: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<BugFormData>({
    name: "",
    strength: "",
    type: "",
  });

  const [bugs, setBugs] = useState<Bug[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { toast, showToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [currentBug, setCurrentBug] = useState<Bug | null>(null);

  useEffect(() => {
    fetchBugs();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const fetchBugs = async (): Promise<void> => {
    try {
      const response = await fetch(endpoints.bugs);
      const data = await response.json();
      setBugs(data);
      setLoading(false);
    } catch (err: unknown) {
      setError(
        `Failed to fetch bugs: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
      setLoading(false);
    }
  };

  const validateBug = (data: BugFormData): string[] => {
    const errors = [];
    const bugTypes = ["air", "ground", "water"];

    const name = data.name?.trim();
    const type = data.type?.trim().toLowerCase();
    const strength = Number(data.strength);

    if (!name) errors.push("Bug name is required");
    if (!type) errors.push("Bug type is required");
    if (!data.strength) errors.push("Strength is required");

    if (strength && (isNaN(strength) || strength < 1 || strength > 100)) {
      errors.push("Strength must be a number between 1 and 100");
    }

    if (type && !bugTypes.includes(type)) {
      errors.push(`Bug type must be one of: ${bugTypes.join(", ")}`);
    }

    return errors;
  };

  const handleAddBug = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const error = validateBug(formData);
      if (error.length > 0) {
        showToast(error[0]);
        return;
      }

      const bugDataToSend = {
        ...formData,
        strength: parseInt(formData.strength, 10),
      };

      const response = await fetch(endpoints.bugs, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bugDataToSend),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, body: ${errorBody}`
        );
      }
      showToast("Bug added!");
      setIsModalOpen(false);
      setFormData({ name: "", strength: "", type: "" });
      fetchBugs();
    } catch (error: unknown) {
      console.error("Error adding bug: ", error);
      showToast(`Failed to add bug: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleEditClick = (bug: Bug): void => {
    setFormData({
      name: bug.name,
      strength: bug.strength.toString(),
      type: bug.type,
    });

    setCurrentBug(bug);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleUpdateBug = async (
    e: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    if (!currentBug) {
      showToast("No bug selected for update!");
      return;
    }
    e.preventDefault();
    try {
      const error = validateBug(formData);
      if (error.length > 0) {
        showToast(`${error[0]}`);
        return;
      }

      const bugDataToSend = {
        ...formData,
        strength: parseInt(formData.strength, 10),
      };

      const response = await fetch(`${endpoints.bugs}/${currentBug.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bugDataToSend),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `Update failed: ${response.statusText}, body: ${errorBody}`
        );
      }

      setIsModalOpen(false);
      setIsEditing(false);
      setFormData({ name: "", strength: "", type: "" });
      setCurrentBug(null);
      fetchBugs();
      showToast("Bug updated successfully!");
    } catch (error: unknown) {
      console.error("Update failed:", error);
      showToast(`Failed to update bug. ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleDeleteBug = async (id: string): Promise<void> => {
    if (!id) {
      console.log("Attempted to delete bug without an ID.");
      showToast("Coutld not delete bug: Missing ID.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this bug?")) return;

    try {
      const response = await fetch(`${endpoints.bugs}/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Delete failed: ${response.status} body: ${errorBody}`);
      }
      setBugs((prevBugs) => prevBugs.filter((bug) => bug.id != id));
      showToast("Bug deleted! 🗑️");
    } catch (error) {
      console.error("Error deleting bug:", error);
      showToast("Error deleting bug");
    }
  };

  if (loading) return <div className="loading">Loading bugs...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="bugs-page">
      {toast && <div className="toast">{toast}</div>}

      <h1>Bugs Collection</h1>
      <div className="bugs-grid">
        {bugs.map((bug) => (
          <div key={bug.id} className="bug-card">
            <div className="bug-card-header">
              <h3>{bug.name}</h3>
              <div className="bug-card-actions">
                <button
                  className="edit-btn"
                  onClick={() => handleEditClick(bug)}
                >
                  ✏️
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteBug(bug.id)}
                >
                  🗑️
                </button>
              </div>
            </div>

            <p>Type: {bug.type}</p>
            <p>Strength: {bug.strength}</p>
          </div>
        ))}
      </div>

      <button
        className="add-bug-btn"
        onClick={() => setIsModalOpen(true)}
        title="Add New Bug"
      >
        +
      </button>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2>{isEditing ? "Edit Bug" : "Add New Bug"}</h2>
        <form onSubmit={isEditing ? handleUpdateBug : handleAddBug}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <input
            type="number"
            name="strength"
            placeholder="Strength (1-100)"
            value={formData.strength}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="type"
            placeholder="Type (air,ground,water)"
            value={formData.type}
            onChange={handleInputChange}
            required
          />
          <button type="submit">{isEditing ? "Update Bug" : "Add Bug"}</button>
        </form>
      </Modal>
    </div>
  );
};

export default Bugs;
