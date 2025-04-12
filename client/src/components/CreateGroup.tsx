import Box from "./Box";
import PrimaryButton from "./PrimaryButton";
import { useForm, SubmitHandler } from "react-hook-form";
import React from 'react';


export type PreCreateGroupProps = {

    groupName: string;
    password: string;
    passwordConfirm: string;
}

export interface CreateGroupComponentProps {
    handleCreateGroupSubmit : (data: PreCreateGroupProps) => void;
}

const CreateGroup : React.FC<CreateGroupComponentProps> = ({handleCreateGroupSubmit}) => {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
      } = useForm<PreCreateGroupProps>()

    const onSubmit: SubmitHandler<PreCreateGroupProps> = (data) => {
        console.log(data);
        handleCreateGroupSubmit(data);
    }

    return(
        <Box title='Créer un nouveau groupe' className={`w-200`}>

            <form id='FORM' onSubmit={handleSubmit(onSubmit)} className='grid grid-cols-2 gap-x-5 gap-y-5'>
            <p className='text-xl text-left'>Nom du groupe</p>
            <input {...register("groupName", ({ required: true, maxLength: 64 }))}  
            type="text"
            className={`bg-white-500 text-black-500 text-left text-base px-3 py-1 rounded-lg outline-1 outline-beige-500`}
            />

            <p className='text-xl text-left'>Mot de passe</p>
            <input
                {...register("password", ({ required: true, minLength: 10, maxLength: 64 }))}
                type="password"
                className={`bg-white-500 text-black-500 text-left text-base px-3 py-1 rounded-lg outline-1 outline-beige-500`}
            />

            <p className='text-xl text-left'>Vérification</p>
            <input
                {...register("passwordConfirm", ({ required: true, minLength: 10, maxLength: 64 }))}
                type="password"
                className={`bg-white-500 text-black-500 text-left text-base px-3 py-1 rounded-lg outline-1 outline-beige-500`}
            />
            
            <p className='text-xl text-left col-span-2 '>Ce mot de passe sera demandé à chaque participant pour se connecter au groupe. Notez le bien, vous ne pourrez pas le modifier.</p>

            <PrimaryButton
            text="Suivant"
            type="submit"
            className={`col-span-2`}
            />
            </form>


        </Box>
      )
}

export default CreateGroup;

