import React from "react";

// Button component
const PrimaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (
  props
) => {
  return (
    <button
      className="bg-red-500 text-white-500 text-base
        w-full px-5 py-1
        rounded-2xl
        shadow-sm-red
        hover:bg-red-400 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed"
      {...props}
    >
      {props.children}
    </button>
  );
};

export default PrimaryButton;
