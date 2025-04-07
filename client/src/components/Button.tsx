import React from 'react';

interface ButtonProps {
  text: string;
  onClick: () => void;
}
// Button component
const Button : React.FC<ButtonProps> = ({ text, onClick }) => {
    return (
      <button
        type="button"
        className="bg-red-500 text-white-500 text-sm px-2 rounded-2xl shadow-sm hover:bg-red-600"
        onClick={onClick}
      >
        {text}
      </button>
    );
  };
  
  export default Button;
  
  