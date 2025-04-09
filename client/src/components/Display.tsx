import { Input } from "postcss";
import PrimaryButton from "./PrimaryButton";
import { ReactNode, useState } from "react";
import SecondaryButton from "./SecondaryButton";

//export default function Display(title : string, ifSecondaryButton? : boolean){
  export interface DisplayProps {
    title : string;
    ifSecondaryButton : boolean;
    children : ReactNode
  }

const Display : React.FC<DisplayProps> = ({ title, ifSecondaryButton, children}) => {

    return(
        <div id='NEW_GROUP_STEP_1' className='flex flex-col gap-y-10 p-10 w-200 outline-1 outline-beige-500 rounded-xl shadow-sm-beige'>
        <p className='text-2xl text-center font-extrabold'>{title}</p>

        {children}

        {ifSecondaryButton && 
        <SecondaryButton
          text="Connexion"
          onClick={() => {}} //METTRE LA FONCTION POUR SE CONNECTER
        />}

        <PrimaryButton
          text="Suivant"
          onClick={() => {}}
        />

      </div>)
}

export default Display;