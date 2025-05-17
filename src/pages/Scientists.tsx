// src/pages/Scientists.tsx
import React, {
  useState,
  useEffect,
  type ChangeEvent,
  type FormEvent,
} from "react";
import Modal from "../components/Modal"; // Assuming this is typed (React.FC<ModalProps>)
import "../styles/Scientists.css";
import useToast from "../hooks/useToast"; // Assuming useToast is typed ({ toast: string, showToast: (msg: string) => void })
import { endpoints } from "../config/api"; // Assuming endpoints is typed

// Define the shape of a Bug object (reusing from Bugs.tsx context or shared types)
interface Bug {
  id: string; // Assuming string IDs like in Bugs.tsx
  name: string;
  strength: number;
  type: string;
  // Add other bug properties if needed
}

// Define the shape of a Scientist object from the API
interface Scientist {
  id: string;
  name: string;
  email: string;
  bugs: Bug[] | null | undefined; // Added | undefined possibility based on usage
  // Add other scientist properties (e.g., created_at)
}

// Define the shape of the form data state
interface ScientistFormData {
  name: string;
  email: string;
  password: string; // Password field for the form
  isEditing?: boolean; // Flag used in validation
}


// Type for the functional component itself
// React.FC correctly implies a return type of React.ReactElement | null
const Scientists: React.FC = () => {

  // State variables with explicit types
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<ScientistFormData>({
    name: "",
    email: "",
    password: "",
  });

  const [scientists, setScientists] = useState<Scientist[]>([]); // Array of Scientist objects
  const [loading, setLoading] = useState<boolean>(true); // boolean state
  const [error, setError] = useState<string | null>(null); // string or null state

  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false); // boolean state
  const [availableBugs, setAvailableBugs] = useState<Bug[]>([]); // Array of Bug objects
  const [selectedBugId, setSelectedBugId] = useState<string>(""); // string state for the selected ID
  const [currentScientist, setCurrentScientist] = useState<Scientist | null>(null); // Scientist object or null

  // useToast hook (assuming it's typed as { toast: string, showToast: (msg: string) => void })
  const { toast, showToast } = useToast();

  const [isEditing, setIsEditing] = useState<boolean>(false); // boolean state
  // expandedCards state: object where keys are scientist IDs (string) and values are booleans
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});


  useEffect(() => {
    fetchScientists();
    // Note: fetch doesn't need cleanup unless using something like AbortController
  }, []); // Empty dependency array

  // 1. Type the event handler for input changes
  // e is a ChangeEvent from an HTMLInputElement
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target; // Destructure name and value from the event target
    setFormData({ ...formData, [name]: value }); // name is a string, value is a string
  };

  // 2. Type fetchScientists function (async function returning Promise<void>)
  const fetchScientists = async (): Promise<void> => {
    try {
      const response = await fetch(endpoints.scientists, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Add auth headers here later when implementing authentication
        },
      });
      if (!response.ok) {
        // Improved error message
         throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }
      // Assuming the API returns an array of Scientist objects
      const data: Scientist[] = await response.json(); // Type assertion based on API response
      setScientists(data);
      setLoading(false);
      setError(null); // Clear error on success

    } catch (err: unknown) { // Use 'unknown' for catch blocks for better type safety
      console.error("Failed to fetch scientists:", err);
      // Type narrowing for 'unknown' error
      let errorMessage = "Failed to fetch scientists";
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      setError(errorMessage);
      setLoading(false);
    }
  };

  // 3. Type validateScientist function (takes ScientistFormData, returns array of strings)
  // This function doesn't need the full ValidateScientistData interface if we handle the isEditing flag outside
  // Let's adjust the function to take ScientistFormData and the isEditing flag separately for clarity
   const validateScientist = (data: ScientistFormData, isEditing: boolean = false): string[] => {
    const errors: string[] = []; // Explicitly type errors array

    // Add checks for null/undefined before accessing properties if they are potentially optional
    const name = data.name?.trim();
    const email = data.email?.trim();
    const password = data.password?.trim(); // Also trim password input

    if (!name || name.length < 2) {
      errors.push("Name must be at least 2 characters long");
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push("Enter a valid email");
    }
    // Password is required only when adding (isEditing is false)
    if (!isEditing && (!password || password.length < 6)) { // Check for empty AND length if required
        errors.push("Password is required and must be at least 6 characters");
    } else if (isEditing && password && password.length < 6) { // If editing, password is optional, but if provided, check length
         errors.push("Password must be at least 6 characters if provided");
    }


    return errors;
  };

  // 4. Type handleAddScientist function (takes FormEvent, returns Promise<void>)
  const handleAddScientist = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // Check whether all fields are ok using the adjusted validateScientist
    // Pass formData and explicitly indicate not editing
    const errors = validateScientist(formData, false); // isEditing is false when adding
    if (errors.length > 0) {
      showToast(errors[0]);
      return;
    }

    try {
      // only send name, email, password for adding
      const scientistDataToSend = { // No need for extra type assertion here, infer from formData
        name: formData.name,
        email: formData.email,
        password: formData.password, // Password is required by validation when adding
      };

      const response = await fetch(endpoints.scientists, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scientistDataToSend),
      });

      if (!response.ok) {
           const errorBody = await response.text();
           throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}, body: ${errorBody}`);
      }

      showToast("Scientist added!");
      setIsModalOpen(false);
      // Reset form data after successful add
      setFormData({ name: "", email: "", password: "" });
      await fetchScientists(); // Refresh the list

    } catch (error: unknown) {
      console.error("Error adding scientist: ", error);
      let errorMessage = "Failed to add scientist";
       if (error instanceof Error) {
         errorMessage = error.message;
       } else if (typeof error === 'string') {
         errorMessage = error;
       }
      showToast(`Failed to add scientist: ${errorMessage}`);
    }
  };

  // 5. Type fetchAvailableBugs function (async function returning Promise<void>)
  const fetchAvailableBugs = async (): Promise<void> => {
    try {
      const response = await fetch(endpoints.bugs, {
         // Add auth headers here later
      });
      if (!response.ok) {
         throw new Error(`Failed to fetch bugs: ${response.status} - ${response.statusText}`);
      }
      const data: Bug[] = await response.json(); // Assuming API returns Bug[]
      setAvailableBugs(data);
    } catch (error: unknown) {
      console.error("Failed to fetch available bugs:", error);
      showToast("Failed to get available bugs"); // This toast message is less specific than others
    }
  };

  // 6. Type openAssignModal function (takes Scientist object, returns void)
  const openAssignModal = (scientist: Scientist): void => {
    setCurrentScientist(scientist);
    fetchAvailableBugs();
    setIsAssignModalOpen(true);
  };

  // 7. Type handleAssignBug function (takes FormEvent, returns Promise<void>)
  const handleAssignBug = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // Ensure a scientist is selected and a bug is selected
    if (!currentScientist) {
      showToast("No scientist selected");
      return;
    }
    if (!selectedBugId) {
        showToast("No bug selected");
        return;
    }

    try {
       // currentScientist is typed as Scientist | null, the check above narrows it to Scientist
       // selectedBugId is typed as string, the check above ensures it's not empty

       const response = await fetch(
          `${endpoints.scientists}/${currentScientist.id}/assign`,
          {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({ bug_id: selectedBugId }),
             // Add auth headers here later
          }
       );

       // Assuming backend sends JSON error details or success response
       const responseData = await response.json();


       if (!response.ok) {
           // Handle specific error status codes if needed
           if (response.status === 409) {
               throw new Error("This bug is already assigned to this scientist");
           }
           // Use backend error message if available, otherwise generic
           throw new Error(responseData.error || `Failed to assign bug: ${response.statusText}`);
       }

       // Optional: Process success response data if needed
       // console.log("Assignment successful response:", responseData);


      await fetchScientists(); // Wait for the fetch to complete
      setIsAssignModalOpen(false);
      setSelectedBugId(""); // Reset selected bug
      setCurrentScientist(null); // Clear current scientist after assignment
      showToast("Bug assigned successfully!");
    } catch (error: unknown) {
      console.error("Error assigning bug: ", error);
      let errorMessage = "Error assigning bug";
       if (error instanceof Error) {
         errorMessage = error.message;
       } else if (typeof error === 'string') {
         errorMessage = error;
       }
      showToast(errorMessage);
    }
  };

  // 8. Type handleDeleteScientist function (takes string ID, returns Promise<void>)
  const handleDeleteScientist = async (id: string): Promise<void> => {
    // Add check for valid id if necessary
    if (!id) {
         console.error("Attempted to delete scientist without an ID.");
         showToast("Could not delete scientist: Missing ID.");
         return;
    }

    // Find scientist to confirm message
    const scientistToDelete = scientists.find(
      // Type of 'scientist' in find is inferred from scientists: Scientist[]
      (scientist) => scientist.id === id // Use strict equality here
    );
    if (!scientistToDelete) {
        // This might happen if the UI is out of sync with the state
        console.error(`Scientist with ID ${id} not found in state.`);
        showToast("Scientist not found in list.");
        // Optionally refetch scientists here if state might be stale
        // fetchScientists();
        return;
    }

    if (
      !window.confirm(
        `Are you sure you want to kick ${scientistToDelete.name || 'this scientist'} out of the team?` // Use nullish coalescing for safety
      )
    )
      return;

    try {
      const response = await fetch(`${endpoints.scientists}/${id}/delete`, {
        method: "DELETE",
         // Add auth headers here later
      });
      if (!response.ok) {
         const errorBody = await response.text();
         throw new Error(`Delete failed: ${response.status} - ${response.statusText}, body: ${errorBody}`);
      }

      // Update state by filtering out the deleted scientist
      setScientists((prevScientists) =>
        // Type of 'prevScientist' array and 'scientist' element is inferred
        prevScientists.filter((scientist) => scientist.id !== id) // Use strict inequality
      );
      showToast("Scientist deleted! 🗑️");
    } catch (error: unknown) {
      console.error(`Error deleting ${scientistToDelete.name || 'scientist'}`, error);
      let errorMessage = `Error deleting ${scientistToDelete.name || 'scientist'}`;
       if (error instanceof Error) {
         errorMessage = error.message;
       } else if (typeof error === 'string') {
         errorMessage = error;
       }
      showToast(errorMessage);
    }
  };

  // 9. Type handleUnassignBug function (takes two string IDs, returns Promise<void>)
  const handleUnassignBug = async (scientistId: string, bugId: string): Promise<void> => {
     // Basic checks for valid IDs
     if (!scientistId || !bugId) {
         console.error("Attempted to unassign bug with missing IDs.");
         showToast("Could not unassign bug: Missing IDs.");
         return;
     }

    const scientist = scientists.find((sci) => sci.id === scientistId); // Type inferred
    if (!scientist) {
      showToast("Scientist not found in list.");
      // Optionally refetch here
      return;
    }

    if (!window.confirm("Are you sure you want to unassign this bug?")) {
      return;
    }

    try {
      const response = await fetch(
        `${endpoints.scientists}/${scientistId}/unassign`,
        {
          method: "POST", // Or DELETE, depending on API design
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bug_id: bugId }),
           // Add auth headers here later
        }
      );

      if (!response.ok) {
          // Assuming backend sends JSON error details
          const data = await response.json();
          throw new Error(data.error || `Failed to unassign bug: ${response.statusText}`);
      }

      await fetchScientists(); // Refresh the list to show changes
      showToast("Bug unassigned successfully!");
    } catch (error:unknown) {
      console.error("Error unassigning bug: ", error);
      let errorMessage = "Error unassigning bug";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      } // Removed extra closing brace here
      showToast(errorMessage );
    }
  };

  // 10. Type handleEditClick function (takes Scientist object, returns void)
  const handleEditClick = (scientist: Scientist): void => {
    // Populate form data from the scientist object
    setFormData({
      name: scientist.name || "", // Use || "" for potential null/undefined names
      email: scientist.email || "", // Use || "" for potential null/undefined emails
      password: "", // Password field is not pre-filled for security
    });

    setCurrentScientist(scientist);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  // 11. Type handleEditScientist function (takes FormEvent, returns Promise<void>)
  const handleEditScientist = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // Ensure current scientist is not null before updating
    // currentScientist is typed as Scientist | null, the check below narrows it
    if (!currentScientist) {
      showToast("No scientist selected for update!");
      return;
    }

    // Pass formData and isEditing flag to validation
    const errors = validateScientist(formData, true); // isEditing is true when editing
    if (errors.length > 0) {
      showToast(errors[0]);
      return;
    }

    try {
        // Only send name, email. Password handling depends on API.
        // Assuming API accepts name and email for PATCH, and password only if included/changed.
        // Current code sends the password field as is (empty string if not typed).
        const scientistDataToSend = {
            name: formData.name,
            email: formData.email,
            password: formData.password, // Send password field, API should handle empty/changed
        };

      const response = await fetch(
        `${endpoints.scientists}/${currentScientist.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(scientistDataToSend),
           // Add auth headers here later
        }
      );

      const data = await response.json(); // Assuming success or error details are JSON

      if (!response.ok) {
          // Use data.error if backend sends it, otherwise statusText
          throw new Error(data.error || `Failed to update scientist: ${response.status} - ${response.statusText}`);
      }

      showToast("Scientist updated successfully!");
      setIsModalOpen(false);
      setIsEditing(false);
      setFormData({ name: "", email: "", password: "" }); // Reset form
      setCurrentScientist(null); // Clear current scientist
      await fetchScientists(); // Refresh the list

    } catch (error: unknown) {
      let errorMessage = "Failed to update scientist";
       if (error instanceof Error) {
         errorMessage = error.message;
       } else if (typeof error === "string") {
         errorMessage = error;
      } // Removed extra closing brace here
      console.error("Update failed:", error);
      showToast(errorMessage);
    }
  };

  // 12. Type toggleCardExpansion function (takes string ID, returns void)
  const toggleCardExpansion = (scientistId: string): void => {
    setExpandedCards((prev) => ({
      ...prev,
      [scientistId]: !prev[scientistId], // Toggle boolean value for the given ID
    }));
  };

  // 13. Type getBugCountBadge function (takes Scientist object, returns JSX element)
  const getBugCountBadge = (scientist: Scientist): React.ReactElement => {
    // Add null check for scientist.bugs and filter out null bugs
    const bugCount = Array.isArray(scientist.bugs)
        ? scientist.bugs.filter((bug) => bug !== null).length
        : 0;

    let badgeClass = "bug-count-badge";
    if (bugCount > 3) badgeClass += " high";
    else if (bugCount > 0) badgeClass += " active";

    // Return a React element (span in this case)
    return <span className={badgeClass}>{bugCount}</span>;
  };

  // Render loading or error state (return React.ReactElement | null)
  if (loading) return <div className="loading">Loading scientists...</div>;
  if (error) return <div className="error">{error}</div>;

  // 14. Type the component's main return value (JSX)
  return (
    <div className="scientists-page">
      <h1>Research Team</h1>
      {/* Render the toast state from the useToast hook */}
      {toast && <div className="toast">{toast}</div>}
      <div className="scientists-grid">
        {/* Type of 'scientist' in map is inferred correctly from scientists: Scientist[] */}
        {scientists.map((scientist) => (
          // Use scientist.id as the key, ensure it's a unique identifier
          <div key={scientist.id} className="scientist-card">
            <div className="card-header">
              <div className="scientist-avatar">
                 {/* Ensure scientist.name exists before accessing charAt */}
                 {scientist.name ? scientist.name.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="scientist-info">
                <div className="scientist-name-row">
                  {/* Ensure scientist.name exists */}
                  <h3>{scientist.name || 'N/A'}</h3>
                  <div className="header-actions">
                    <button
                      className="edit-btn"
                      onClick={() => handleEditClick(scientist)} // Pass the typed scientist object
                      title="Edit Scientist"
                    >
                      ✏️
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteScientist(scientist.id)} // Pass scientist ID
                      title="Delete Scientist"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                {/* Ensure scientist.email exists */}
                <p className="scientist-email">{scientist.email || 'N/A'}</p>
              </div>
            </div>

            <div className="card-body">
              <div className="bug-status-bar">
                <span className="bug-status-label">Assigned Bugs</span>
                {/* getBugCountBadge expects a Scientist object */}
                {getBugCountBadge(scientist)}
              </div>

              {/* Add checks for scientist.bugs being truthy and an array */}
              {scientist.bugs && Array.isArray(scientist.bugs) &&
                scientist.bugs.filter((bug) => bug !== null).length > 0 && (
                  <div
                    className={`bug-preview ${
                      expandedCards[scientist.id] ? "expanded" : ""
                    }`}
                  >
                    <div
                      className="bug-preview-header"
                      onClick={() => toggleCardExpansion(scientist.id)} // Pass scientist ID
                    >
                      <span>View Assigned Bugs</span>
                      <span className="expand-icon">
                        {expandedCards[scientist.id] ? "▼" : "▶"}
                      </span>
                    </div>

                    {/* Only render list if expanded */}
                    {expandedCards[scientist.id] && (
                      <div className="assigned-bug-list">
                        <ul>
                          {/* Check bug is not null before mapping */}
                          {scientist.bugs
                            .filter((bug) => bug !== null)
                            .map((bug) => ( // Type of 'bug' is inferred from the filter result (Bug)
                              // Use bug.id as key
                              <li key={bug.id} className="bug-item">
                                <div className="bug-details">
                                  <span className="bug-name">{bug.name}</span>
                                  <span className="bug-type">{bug.type}</span>
                                </div>
                                <div className="bug-item-actions">
                                  {/* Ensure bug.strength exists */}
                                  <span className="bug-strength">
                                    Strength: {bug.strength ?? "N/A"} {/* Use nullish coalescing */}
                                  </span>
                                  <button
                                    className="unassign-bug-btn"
                                    onClick={(e) => {
                                      // Type the event object for stopPropagation if needed (less common for simple stopProp)
                                      e.stopPropagation(); // Prevent toggling the card
                                      // Pass scientist ID and bug ID
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
                onClick={() => openAssignModal(scientist)} // Pass the typed scientist object
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
          setCurrentScientist(null); // Clear current scientist state when adding
          setFormData({ name: "", email: "", password: "" });
          setIsModalOpen(true);
        }}
        title="Add New Scientist"
      >
        +
      </button>
      {/* Add/Edit Scientist Modal (assuming Modal component is typed) */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2>{isEditing ? "Edit Scientist" : "Add New Scientist"}</h2>
        {/* Use correct handler based on isEditing */}
        <form onSubmit={isEditing ? handleEditScientist : handleAddScientist}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleInputChange} // Handler typed
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange} // Handler typed
            required
          />
          <input
            type="password"
            name="password"
            placeholder={isEditing ? "Leave blank to keep current" : "Password"} // Optional password text
            value={formData.password}
            onChange={handleInputChange} // Handler typed
            required={!isEditing} // Password is required only when NOT editing
          />
          <button type="submit">
            {isEditing ? "Update Scientist" : "Add Scientist"}
          </button>
        </form>
      </Modal>
      {/* Assign Bug Modal (assuming Modal component is typed) */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
      >
        {/* Use nullish coalescing operator for safety */}
        <h2>Assign Bug to {currentScientist?.name ?? "N/A"}</h2>
        <form onSubmit={handleAssignBug}>
          <select
            value={selectedBugId}
            // Type of e in onChange is inferred by React's Select element typing
            onChange={(e) => setSelectedBugId(e.target.value)}
            required
          >
            <option value="">Select a bug</option>
            {/* Assuming availableBugs is array of Bug objects */}
            {availableBugs.map((bug) => (
              // Use bug.id as key, ensure bug properties exist
              <option key={bug.id} value={bug.id}>
                {bug.name || 'Unknown Bug'} - Strength: {bug.strength ?? "N/A"}
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