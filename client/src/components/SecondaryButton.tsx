import React from 'react';
import { ButtonProps } from './PrimaryButton';

// Button component
const SecondaryButton: React.FC<ButtonProps> = ({ text,type,disabled, onClick }) => {
    return (
      <button
        type={type}
        disabled={disabled}
        className={`bg-white-500 text-black-500 outline-1 outline-red-500 text-sm px-5 py-1 rounded-2xl shadow-sm-red hover:bg-white-600 cursor-pointer`}
        onClick={onClick}
      >
        {text}
      </button>
    );
  };
  
  export default SecondaryButton;
  
  