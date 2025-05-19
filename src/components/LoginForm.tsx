// src/components/LoginForm.tsx
import React, { useState, type ChangeEvent, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { type LoginCredentials } from "../context/AuthContext";

interface LoginFormProps {
  onSuccess?: () => void;
  // *** NEW: Prop to trigger switching to the signup form ***
  onSwitchToSignup?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToSignup }) => { // Destructure new prop
  const [formData, setFormData] = useState<LoginCredentials>({
    email: "",
    password: "",
  });

  const { login, loading, error } = useAuth();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      alert("Please enter both email and password.");
      return;
    }

    try {
      await login(formData);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      console.error("Login form caught error (handled by AuthContext):", err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div>
        <label htmlFor="login-email">Email:</label> {/* Use unique ID */}
        <input
          type="email"
          id="login-email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
      </div>

      <div>
        <label htmlFor="login-password">Password:</label> {/* Use unique ID */}
        <input
          type="password"
          id="login-password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleInputChange}
          required
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>

      {/* *** NEW: Button/Link to switch to Signup form *** */}
      {onSwitchToSignup && ( // Only render if the prop is provided
         <div style={{ textAlign: 'center', marginTop: '1rem' }}> {/* Add some spacing */}
            <p>Don't have an account?</p>
             {/* Use a button or a link styled as button/text */}
            <button
                type="button" // Important: This button does NOT submit the form
                onClick={onSwitchToSignup} // Call the function passed from parent
                style={{ background: 'none', border: 'none', color: '#3498db', cursor: 'pointer', textDecoration: 'underline', fontSize: '1rem' }} // Basic styling
            >
                Sign Up
            </button>
         </div>
      )}
      {/* *** End NEW Button *** */}
    </form>
  );
};

export default LoginForm;