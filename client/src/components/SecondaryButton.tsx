import React from 'react';
import { ButtonProps } from './PrimaryButton';

// Button component
const SecondaryButton: React.FC<ButtonProps> = ({ text, onClick }) => {
    return (
      <button
        type="button"
        className={`bg-white-500 text-black-500 outline-1 outline-red-500 text-sm px-5 py-1 rounded-2xl shadow-sm-red hover:bg-white-600 cursor-pointer`}
        onClick={onClick}
      >
        {text}
      </button>
    );
  };
  
  export default SecondaryButton;
  
  