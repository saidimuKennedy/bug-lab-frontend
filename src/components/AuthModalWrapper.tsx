import React, { useState } from "react";
import Modal from "./Modal";
import LoginForm from "./LoginForm";

const AuthModalWrapper: React.FC = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  // Optional: Handle redirection or modal closing after successful login
  // const handleLoginSuccess = () => {
  //   closeLoginModal();
  //   // Optionally redirect the user if needed, though ProtectedRoute might handle initial redirect
  //   // navigate('/');
  // };

  return (
    <>
      {/* Button to open the modal */}
      <button onClick={openLoginModal}>Open Login Modal</button>

      {/* The Modal component */}
      <Modal isOpen={isLoginModalOpen} onClose={closeLoginModal}>
        {/* Render the LoginForm component as a child of the Modal */}
        {/* Pass the handleLoginSuccess prop if you want the form to close the modal */}
        <LoginForm
        // onSuccess={handleLoginSuccess}
        />
      </Modal>
    </>
  );
};

export default AuthModalWrapper;
