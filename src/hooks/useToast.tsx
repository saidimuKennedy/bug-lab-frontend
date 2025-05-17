import { useCallback, useState } from "react";
import "../styles/Toast.css";

interface UseToastReturn {
  toast: string;
  showToast: (msg: string) => void;
}

const useToast = (): UseToastReturn => {
  const [toast, setToast] = useState<string>("");

  // useCallback for stable reference
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }, []);

  return { toast, showToast };
};
export default useToast;
