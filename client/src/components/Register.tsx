'use client'

import Box from "./Box";
import { useForm, SubmitHandler } from "react-hook-form";
import PrimaryButton from "./PrimaryButton";
import { UserSelf } from "super-santa-sdk/dist/api/dto/user";
import { GroupModel } from "super-santa-sdk/dist/api/dto/group";
import React from 'react';


  export interface RegisterProps {

    groupName: string;
    handleRegisterSubmit : (data: RegisterForm) => Promise<void>;
    className?: string;

  }

  export type RegisterForm = {
    email: string;
    pseudo: string;
    password: string;
    passwordConfirm: string;
  }
const Register : React.FC<RegisterProps> = ({groupName, handleRegisterSubmit,className}) => {

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
      } = useForm<RegisterForm>()
    const onSubmit: SubmitHandler<RegisterForm> = (data) => {
        console.log(data);
        handleRegisterSubmit(data);
    }
    return(
        <Box title={`Rejoindre le groupe : ${groupName}`} className={`w-200 ${className}`}>
            <form className="flex flex-col gap-y-10" onSubmit={handleSubmit(onSubmit)}>
            
            <div className="grid grid-cols-[auto_1fr] gap-x-10 gap-y-5" >
                <p className="text-xl text-left">Adresse mail</p>
                <input
                    type="email"
                    placeholder="Email"
                    className={`bg-white-500 text-black-500 text-left text-base px-3 py-1 rounded-lg outline-1 outline-beige-500 ${className}`}
                    {...register("email", { required: "Adresse mail requise" })}
                />
                {errors.email && <span className="text-red-500 col-span-2">{errors.email.message}</span>}

                <p className="text-xl text-left">Pseudo</p>
                <input
                    type="text"
                    placeholder="Pseudo"
                    className={`bg-white-500 text-black-500 text-left text-base px-3 py-1 rounded-lg outline-1 outline-beige-500 ${className}`}
                    {...register("pseudo", { 
                        required: "Pseudo requis",
                        minLength: { value:3, message:"Trop court"},
                        maxLength: {value:64,message:"Trop long"},
                    })}
                />
                {errors.pseudo && <span className="text-red-500 col-span-2">{errors.pseudo.message}</span>}

                <p className="text-xl text-left">Mot de passe</p>
                <input
                    type="password"
                    placeholder="Mot de passe"
                    className={`bg-white-500 text-black-500 text-left text-base px-3 py-1 rounded-lg outline-1 outline-beige-500 ${className}`}
                    {...register("password", { 
                        required: "Mot de passe requis",
                        minLength: {
                            value: 10,
                            message: "Le mot de passe doit faire au moins 10 caractères",
                        },
                        maxLength: {
                            value: 64,
                            message: "Le mot de passe doit faire au maximum 64 caractères",
                        }, 
                    })}
                />
                {errors.password && <span className="text-red-500 col-span-2">{errors.password.message}</span>}

                <p className="text-xl text-left">Vérification</p>

                <input
                    type="password"
                    placeholder="Vérification"
                    className={`bg-white-500 text-black-500 text-left text-base px-3 py-1 rounded-lg outline-1 outline-beige-500 ${className}`}
                    {...register("passwordConfirm", {
                    minLength: {
                        value: 10,
                        message: "Le mot de passe doit faire au moins 10 caractères",
                    },
                    maxLength: {
                        value: 64,
                        message: "Le mot de passe doit faire au maximum 64 caractères",
                    },  
                    required: "Vérification requise",
                    validate: (value) =>
                        value === watch("password") || "Les mots de passe ne correspondent pas",
                    })}
                />

                {errors.passwordConfirm && (
                <span className="text-red-500 col-span-2">{errors.passwordConfirm.message}</span>
                )}

            </div>

            <p className="text-xl text-left">
            Ce mot de passe, vous sera demandé pour vous connecter au groupe. Si vous l’oubliez vous ne pourrez plus vous connecter et vous devrez recréer un compte.
            </p>

            <PrimaryButton text="Rejoindre" type="submit" />
            </form>
        </Box>
      )
}

export default Register;