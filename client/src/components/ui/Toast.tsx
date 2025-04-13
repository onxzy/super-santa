import { useEffect, useRef, useState } from "react";
import { FiAlertCircle, FiCheckCircle, FiX } from "react-icons/fi";
import "./Toast.css";

export interface ToastProps {
  message: string;
  type: "success" | "error";
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
  id?: number;
}

export default function Toast({
  message,
  type,
  isVisible,
  onClose,
  duration = 5000,
  id = 0,
}: ToastProps) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isFading, setIsFading] = useState(false);

  // Reset timer when the toast changes or becomes visible
  useEffect(() => {
    if (isVisible) {
      setIsFading(false);

      // Clear any existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Set new timer
      timerRef.current = setTimeout(() => {
        handleClose();
      }, duration);

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }
  }, [isVisible, duration, id]); // Add id to dependency array

  const handleClose = () => {
    setIsFading(true);
    // Wait for fade animation to complete before actually closing
    setTimeout(() => {
      onClose();
    }, 300); // Match the duration of fadeOut animation
  };

  if (!isVisible) return null;

  const bgColor = type === "success" ? "bg-green-500" : "bg-red-500";
  const icon =
    type === "success" ? (
      <FiCheckCircle className="text-2xl" />
    ) : (
      <FiAlertCircle className="text-2xl" />
    );

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4">
      <div
        className={`${bgColor} text-white rounded-lg shadow-lg flex items-center p-4 max-w-md ${
          isFading ? "animate-fadeOut" : "animate-slideDown"
        }`}
        key={id} // Add key to force re-render
      >
        <div className="mr-3">{icon}</div>
        <p className="flex-grow">{message}</p>
        <button
          onClick={handleClose}
          className="ml-3 text-white hover:text-gray-200 transition-colors cursor-pointer"
        >
          <FiX className="text-xl" />
        </button>
      </div>
    </div>
  );
}
