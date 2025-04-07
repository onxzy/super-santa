import React from 'react';

export interface ButtonProps {
  text: string;
  onClick: () => void;
}
// Button component
const PrimaryButton : React.FC<ButtonProps> = ({ text, onClick }) => {
    return (
      <button
        type="button"
        className="bg-red-500 text-white-500 text-sm px-5 py-1  rounded-2xl shadow-sm-red hover:bg-red-600"
        onClick={onClick}
      >
        {text}
      </button>
    );
  };
  
  export default PrimaryButton;
  
  