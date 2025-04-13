import React from "react";
// Button component
const AccentButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (
  props
) => {
  return (
    <button
      className="bg-white-500 text-black-500 text-sm
      x-5 py-1 w-full
      rounded-2xl outline-1 outline-green-500
      shadow-sm-green 
      hover:bg-green-100 cursor-pointer
      disabled:opacity-50 disabled:cursor-not-allowed"
      {...props}
    >
      {props.children}
    </button>
  );
};

export default AccentButton;
