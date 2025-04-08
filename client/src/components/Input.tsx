import React from "react";

interface InputProps {
  type: string;
  placeholder: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input : React.FC<InputProps> = ({ type, placeholder, value, onChange }: InputProps) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="`bg-white-500 text-black-500 text-left text-sm px-3 py-1 rounded-lg outline-1 outline-beige-500"
    />
  );
};
export default Input;