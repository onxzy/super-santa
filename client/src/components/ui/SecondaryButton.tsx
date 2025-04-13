import React from "react";

// Button component
const SecondaryButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = (props) => {
  return (
    <button
      className="bg-white-500 text-black-500 text-sm 
      px-5 py-1  w-full
      outline-1 outline-red-500 rounded-2xl
      shadow-sm-red
      hover:bg-red-100 cursor-pointer
      disabled:opacity-50 disabled:cursor-not-allowed"
      {...props}
    >
      {props.children}
    </button>
  );
};

export default SecondaryButton;
