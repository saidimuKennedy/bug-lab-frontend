// Modal.jsx
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
const Modal = ({ isOpen, onClose, children }) => {
	const modalRef = useRef(null);

	// Handle ESC key press to close modal
	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === "Escape") {
				onClose();
			}
		};

		// hide the modal when escape is clicked
		if (isOpen) {
			window.addEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "hidden";
		}

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "unset";
		};
	}, [isOpen, onClose]);

	// Handle click outside to close
	const handleOverlayClick = (e) => {
		if (modalRef.current && !modalRef.current.contains(e.target)) {
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
