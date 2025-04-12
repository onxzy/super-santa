import Box from "./Box";
import PrimaryButton from "./PrimaryButton";
import React from "react";

export interface GroupInfoProps {
  handleGroupInfo: () => void;
}
const GroupInfo : React.FC<GroupInfoProps> = ({handleGroupInfo}) =>{
    return (
        <Box title='Créer un nouveau groupe' className='w-200'>

        <div id='INFO' className='flex flex-col gap-y-5'>
          <div className='flex gap-x-5 items-center'>
            <p className='text-2xl text-left font-extrabold'>1</p>
            <p className='text-xl text-left grow'>Invitez les participants en leur partagant le lien de connexion au groupe visible dans le panneau d’administration.</p>
          </div>

          <div className='flex gap-x-5 items-center'>
          <p className='text-2xl text-left font-extrabold'>2</p>
          <p className='text-xl text-left'>Une fois tout vos participants inscrits, procédez au tirage depuis votre pannel d’administration</p>
          </div>

          <div className='flex gap-x-5 items-center'>
          <p className='text-2xl text-left font-extrabold'>3</p>
          <p className='text-xl text-left'>Les participants pourrons découvrir la personne qui leur a été assignée depuis leur compte</p>
          </div>

        </div>

        <PrimaryButton
          text="Suivant"
          onClick={() => {handleGroupInfo()}}
        />
      </Box>
    );
  }

export default GroupInfo;