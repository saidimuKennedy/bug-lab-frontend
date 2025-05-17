import React, { useEffect, useRef } from "react";
import "../styles/Modal.css";

/* alternatively 
const Modal = (props)=>{
	const isOpen = props.isOpen;
	const onClose = props.onClose;
	const children = props.children
	...only this time it is not destructed 
}
*/

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

// React.FC is used and passing ModalProps as a generic argument
//
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    // hide the modal when escape is clicked
    //
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);

      // handle for null
      if (document.body.style) {
        document.body.style.overflow = "hidden";
      }
    }

    return () => {
      if (isOpen) {
        window.removeEventListener("keydown", handleKeyDown);
        if (document.body.style) {
          document.body.style.overflow = "unset";
        }
      }
    };
  }, [isOpen, onClose]);

  // Handle click outside to close
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`modal-overlay ${isOpen ? "open" : ""}`}
      onClick={handleOverlayClick}
    >
      <div className="modal" ref={modalRef}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <span aria-hidden="true">×</span>
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
