import React from 'react';

export interface ButtonProps {
  text: string;
  onClick: () => void;
  className?: string;
}
// Button component
const PrimaryButton : React.FC<ButtonProps> = ({ text, onClick, className }) => {
    return (
      <button
        type="button"
        className={`bg-red-500 text-white-500 text-base px-5 py-1 cursor-pointer rounded-2xl shadow-sm-red hover:bg-red-600 ${className} `}
        onClick={onClick}
      >
        {text}
      </button>
    );
  };
  
  export default PrimaryButton;
  
  