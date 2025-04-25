import { useCallback, useState } from "react";
import "../styles/Toast.css";
const useToast = () => {
	const [toast, setToast] = useState("");

	// useCallback for stable reference
	const showToast = useCallback((msg) => {
		setToast(msg);
		setTimeout(() => setToast(""), 3000);
	}, []);

	return { toast, showToast };
};
export default useToast;
