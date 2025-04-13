import { ReactNode } from "react";

//export default function Box(title : string, ifSecondaryButton? : boolean){
export interface BoxProps {
  title: string;
  className?: string;
  children?: ReactNode;
}

const Box: React.FC<BoxProps> = ({ title, className, children }) => {
  return (
    <div
      className={`flex flex-col gap-y-10 p-10 outline-1 outline-beige-500 rounded-xl shadow-sm-beige ${className}`}
    >
      <p className="text-2xl text-center font-extrabold">{title}</p>

      {children}
    </div>
  );
};

export default Box;
