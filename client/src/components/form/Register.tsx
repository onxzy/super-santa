"use client";

import Box from "../ui/Box";
import { useForm, SubmitHandler } from "react-hook-form";
import PrimaryButton from "../ui/PrimaryButton";
import React from "react";
import { UseFormSetError } from "react-hook-form";
import SecondaryButton from "../ui/SecondaryButton";

export interface RegisterProps {
  groupName: string;
  handleRegisterSubmit: (
    data: RegisterForm,
    setError: UseFormSetError<RegisterForm>
  ) => Promise<void>;
  className?: string;
  handleBack?: () => void;
}

export type RegisterForm = {
  email: string;
  pseudo: string;
  password: string;
  passwordConfirm: string;
};
const Register: React.FC<RegisterProps> = ({
  groupName,
  handleRegisterSubmit,
  className,
  handleBack,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm<RegisterForm>();

  const onSubmit: SubmitHandler<RegisterForm> = async (data) =>
    await handleRegisterSubmit(data, setError);

  return (
    <Box
      title={`Rejoindre le groupe : ${groupName}`}
      className={`w-200 ${className}`}
    >
      <form
        className="flex flex-col gap-y-10"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="grid grid-cols-[auto_1fr] justify-start gap-x-10 gap-y-5">
          <p className="text-xl text-left">Adresse mail</p>
          <div className="flex flex-col gap-y-2">
            <input
              type="email"
              placeholder="Email"
              className={`bg-white-500 text-black-500 text-left text-base px-3 py-1 rounded-lg outline-1 outline-beige-500 ${className}`}
              {...register("email", {
                required: "Adresse mail requise",
                maxLength: {
                  value: 64,
                  message: "L'adresse mail doit faire au maximum 64 caractères",
                },
              })}
            />
            {errors.email && (
              <span className="text-red-500">{errors.email.message}</span>
            )}
          </div>

          <p className="text-xl text-left">Pseudo</p>
          <div className="flex flex-col gap-y-2">
            <input
              type="text"
              placeholder="Pseudo"
              className={`bg-white-500 text-black-500 text-left text-base px-3 py-1 rounded-lg outline-1 outline-beige-500 ${className}`}
              {...register("pseudo", {
                required: "Pseudo requis",
                minLength: { value: 3, message: "Trop court" },
                maxLength: { value: 64, message: "Trop long" },
              })}
            />
            {errors.pseudo && (
              <span className="text-red-500">{errors.pseudo.message}</span>
            )}
          </div>

          <p className="text-xl text-left">Mot de passe</p>
          <div className="flex flex-col gap-y-2">
            <input
              type="password"
              placeholder="Mot de passe"
              className={`bg-white-500 text-black-500 text-left text-base px-3 py-1 rounded-lg outline-1 outline-beige-500 ${className}`}
              {...register("password", {
                required: "Mot de passe requis",
                minLength: {
                  value: 4, // FIXME:
                  message: "Le mot de passe doit faire au moins 10 caractères",
                },
                maxLength: {
                  value: 64,
                  message:
                    "Le mot de passe doit faire au maximum 64 caractères",
                },
              })}
            />
            {errors.password && (
              <span className="text-red-500">{errors.password.message}</span>
            )}
          </div>

          <p className="text-xl text-left">Vérification</p>
          <div className="flex flex-col gap-y-2">
            <input
              type="password"
              placeholder="Vérification"
              className={`bg-white-500 text-black-500 text-left text-base px-3 py-1 rounded-lg outline-1 outline-beige-500 ${className}`}
              {...register("passwordConfirm", {
                minLength: {
                  value: 4, // FIXME:
                  message: "Le mot de passe doit faire au moins 10 caractères",
                },
                maxLength: {
                  value: 64,
                  message:
                    "Le mot de passe doit faire au maximum 64 caractères",
                },
                required: "Vérification requise",
                validate: (value) =>
                  value === watch("password") ||
                  "Les mots de passe ne correspondent pas",
              })}
            />

            {errors.passwordConfirm && (
              <span className="text-red-500">
                {errors.passwordConfirm.message}
              </span>
            )}
          </div>
        </div>

        <p className="text-xl text-left">
          Ce mot de passe, vous sera demandé pour vous connecter au groupe. Si
          vous l’oubliez vous ne pourrez plus vous connecter et vous devrez
          recréer un compte.
        </p>
        <div id="BUTTONS" className="flex flex-row gap-x-5">
          {handleBack && (
            <div className="grow">
              <SecondaryButton type="button" onClick={handleBack}>
                Retour
              </SecondaryButton>
            </div>
          )}
          <div className="flex flex-col gap-y-2 grow">
            <PrimaryButton type="submit">S'inscrire</PrimaryButton>

            {errors.root && (
              <span className="text-red-500 ">{errors.root.message}</span>
            )}
          </div>
        </div>
      </form>
    </Box>
  );
};

export default Register;
