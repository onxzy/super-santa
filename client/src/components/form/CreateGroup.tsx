import Box from "../ui/Box";
import PrimaryButton from "../ui/PrimaryButton";
import { useForm } from "react-hook-form";
import React from "react";

export type PreCreateGroupProps = {
  groupName: string;
  password: string;
  passwordConfirm: string;
};

export interface CreateGroupComponentProps {
  handleCreateGroupSubmit: (data: PreCreateGroupProps) => void;
}

const CreateGroup: React.FC<CreateGroupComponentProps> = ({
  handleCreateGroupSubmit,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm<PreCreateGroupProps>();

  return (
    <Box title="Créer un nouveau groupe" className={`w-200`}>
      <form
        id="FORM"
        onSubmit={handleSubmit(handleCreateGroupSubmit)}
        className="grid grid-cols-2 gap-x-5 gap-y-5"
      >
        <p className="text-xl text-left">Nom du groupe</p>
        <div className="flex flex-col gap-y-2">
          <input
            {...register("groupName", {
              required: "Le nom du groupe est requis",
              minLength: {
                value: 3,
                message: "Le nom du groupe doit contenir au moins 3 caractères",
              },
              maxLength: {
                value: 64,
                message: "Le nom du groupe ne peut pas dépasser 64 caractères",
              },
            })}
            type="text"
            className="bg-white-500 text-black-500 text-left text-base px-3 py-1 rounded-lg outline-1 outline-beige-500"
          />
          {errors.groupName && (
            <span className="text-red-500 text-sm">
              {errors.groupName.message}
            </span>
          )}
        </div>

        <p className="text-xl text-left">Mot de passe</p>
        <div className="flex flex-col gap-y-2">
          <input
            {...register("password", {
              required: "Le mot de passe est requis",
              minLength: {
                value: 8,
                message: "Le mot de passe doit contenir au moins 10 caractères",
              },
              maxLength: {
                value: 64,
                message: "Le mot de passe ne peut pas dépasser 64 caractères",
              },
            })}
            type="password"
            className="bg-white-500 text-black-500 text-left text-base px-3 py-1 rounded-lg outline-1 outline-beige-500"
          />
          {errors.password && (
            <span className="text-red-500 text-sm">
              {errors.password.message}
            </span>
          )}
        </div>

        <p className="text-xl text-left">Vérification</p>
        <div className="flex flex-col gap-y-2">
          <input
            {...register("passwordConfirm", {
              required: "La vérification du mot de passe est requise",
              minLength: {
                value: 8,
                message: "Le mot de passe doit contenir au moins 10 caractères",
              },
              maxLength: {
                value: 64,
                message: "Le mot de passe ne peut pas dépasser 64 caractères",
              },
              validate: (value) =>
                value === watch("password") ||
                "Les mots de passe ne correspondent pas",
            })}
            type="password"
            className="bg-white-500 text-black-500 text-left text-base px-3 py-1 rounded-lg outline-1 outline-beige-500"
          />
          {errors.passwordConfirm && (
            <span className="text-red-500 text-sm">
              {errors.passwordConfirm.message}
            </span>
          )}
        </div>

        <p className="text-xl text-left col-span-2 ">
          Ce mot de passe sera demandé à chaque participant pour se connecter au
          groupe. Notez le bien, vous ne pourrez pas le modifier.
        </p>

        <div className="col-span-2">
          <PrimaryButton type="submit">Suivant</PrimaryButton>
        </div>
      </form>
    </Box>
  );
};

export default CreateGroup;
