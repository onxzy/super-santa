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
        setError,
      } = useForm<PreCreateGroupProps>()

    const onSubmit: SubmitHandler<PreCreateGroupProps> = (data) => {
        console.log(data);
        handleCreateGroupSubmit(data);
    }

    return(
        <Box title='Créer un nouveau groupe' className={`w-200`}>

            <form id='FORM' onSubmit={handleSubmit(onSubmit)} className='grid grid-cols-2 gap-x-5 gap-y-5'>
                <p className='text-xl text-left'>Nom du groupe</p>
            <div className="flex flex-col">
                <input 
                {...register("groupName", { required: "Le nom du groupe est requis", maxLength: { value: 64, message: "Le nom du groupe ne peut pas dépasser 64 caractères" } })}  
                type="text"
                className={`bg-white-500 text-black-500 text-left text-base px-3 py-1 rounded-lg outline-1 outline-beige-500`}
                />
                {errors.groupName && <span className="text-red-500 text-sm">{errors.groupName.message}</span>}
            </div>

                <p className='text-xl text-left'>Mot de passe</p>
            <div className="flex flex-col">
                <input
                {...register("password", { required: "Le mot de passe est requis", minLength: { value: 10, message: "Le mot de passe doit contenir au moins 10 caractères" }, maxLength: { value: 64, message: "Le mot de passe ne peut pas dépasser 64 caractères" } })}
                type="password"
                className={`bg-white-500 text-black-500 text-left text-base px-3 py-1 rounded-lg outline-1 outline-beige-500`}
                />
                {errors.password && <span className="text-red-500 text-sm">{errors.password.message}</span>}
            </div>

                <p className='text-xl text-left'>Vérification</p>
            <div  className="flex flex-col">
                <input
                {...register("passwordConfirm", { required: "La vérification du mot de passe est requise", minLength: { value: 10, message: "Le mot de passe doit contenir au moins 10 caractères" }, maxLength: { value: 64, message: "Le mot de passe ne peut pas dépasser 64 caractères" } })}
                type="password"
                className={`bg-white-500 text-black-500 text-left text-base px-3 py-1 rounded-lg outline-1 outline-beige-500`}
                />
                {errors.passwordConfirm && <span className="text-red-500 text-sm">{errors.passwordConfirm.message}</span>}
            </div>
            
            <p className='text-xl text-left col-span-2 '>Ce mot de passe sera demandé à chaque participant pour se connecter au groupe. Notez le bien, vous ne pourrez pas le modifier.</p>

            <PrimaryButton
                text="Suivant"
                type="submit"
                className={`col-span-2`}
            />

            {errors.root && <span className="text-red-500 text-sm col-span-2">{errors.root.message}</span>}
            </form>



        </Box>
      )
}

export default CreateGroup;