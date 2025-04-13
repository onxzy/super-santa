"use client";
import { createContext, useState, useContext, ReactNode, useRef } from "react";
import Toast from "@/components/ui/Toast";

export interface ToastMessage {
  id: number;
  message: string;
  type: "success" | "error";
  isVisible: boolean;
}

interface ToastContextType {
  toast: ToastMessage;
  showToast: (message: string, type?: "success" | "error") => void;
  hideToast: () => void;
}

const defaultToastContext: ToastContextType = {
  toast: {
    id: 0,
    message: "",
    type: "success",
    isVisible: false,
  },
  showToast: () => {},
  hideToast: () => {},
};

export const ToastContext =
  createContext<ToastContextType>(defaultToastContext);

export function useToast() {
  return useContext(ToastContext);
}

// ToastContainer component moved directly into the ToastContext file
export function ToastContainer() {
  const { toast, hideToast } = useContext(ToastContext);

  return (
    <Toast
      message={toast.message}
      type={toast.type}
      isVisible={toast.isVisible}
      onClose={hideToast}
      id={toast.id}
    />
  );
}

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toast, setToast] = useState<ToastMessage>({
    id: 0,
    message: "",
    type: "success",
    isVisible: false,
  });

  const toastIdRef = useRef(0);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    // Clear any existing hide timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    // If a toast is already visible, use the Toast component's internal fade mechanism
    // Otherwise just show the new toast
    toastIdRef.current += 1;
    setToast({
      id: toastIdRef.current,
      message,
      type,
      isVisible: true,
    });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  };

  return (
    <ToastContext.Provider value={{ toast, showToast, hideToast }}>
      {children}
    </ToastContext.Provider>
  );
}
