// src/components/SignupForm.tsx
import React, { useState, type ChangeEvent, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { type SignupCredentials } from '../context/AuthContext';

interface SignupFormProps {
    onSuccess?: () => void;
    onSwitchToLogin?: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSuccess, onSwitchToLogin }) => { // Destructure new prop
    const [formData, setFormData] = useState<SignupCredentials>({
      name: '',
      email: '',
      password: '',
    });
    const [confirmPassword, setConfirmPassword] = useState('');

    const { signup, loading, error } = useAuth();

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
      const { name, value } = e.target;
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    };

     const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
         setConfirmPassword(e.target.value);
     };


    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
      e.preventDefault();

      if (!formData.name || !formData.email || !formData.password || !confirmPassword) {
          alert('Please fill in all fields.');
          return;
      }
       if (formData.password !== confirmPassword) {
           alert('Passwords do not match.');
           return;
       }

      try {
        await signup(formData);
        if (onSuccess) {
          onSuccess();
        }
      } catch (err) {
        console.error("Signup form caught signup error:", err);
      }
    };

    return (
      <form onSubmit={handleSubmit}>
        <h2>Sign Up</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div>
            <label htmlFor="signup-name">Name:</label> {/* Use unique ID */}
            <input
              type="text"
              id="signup-name"
              placeholder='Name'
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
        </div>

        <div>
          <label htmlFor="signup-email">Email:</label>
          <input
            type="email"
            id="signup-email"
            placeholder='Email'
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label htmlFor="signup-password">Password:</label>
          <input
            type="password"
            id="signup-password"
            placeholder='Password'
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </div>

         <div>
          <label htmlFor="signup-confirm-password">Confirm Password:</label> {/* Use unique ID */}
          <input
            type="password"
            id="signup-confirm-password"
            name="confirmPassword"
            placeholder='Confirm password'
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            required
          />
        </div>


        <button type="submit" disabled={loading}>
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>

         {/* *** NEW: Button/Link to switch to Login form *** */}
         {onSwitchToLogin && ( // Only render if the prop is provided
            <div style={{ textAlign: 'center', marginTop: '1rem' }}> {/* Add some spacing */}
               <p>Already have an account?</p>
                {/* Use a button or a link styled as button/text */}
               <button
                   type="button" // Important: This button does NOT submit the form
                   onClick={onSwitchToLogin} // Call the function passed from parent
                   style={{ background: 'none', border: 'none', color: '#3498db', cursor: 'pointer', textDecoration: 'underline', fontSize: '1rem' }} // Basic styling
               >
                   Login
               </button>
            </div>
         )}
         {/* *** End NEW Button *** */}

      </form>
    );
};

export default SignupForm;