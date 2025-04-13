import Box from "../ui/Box";
import PrimaryButton from "../ui/PrimaryButton";
import { useForm, SubmitHandler, UseFormSetError } from "react-hook-form";
import SecondaryButton from "../ui/SecondaryButton";

type LoginUserForm = {
  email: string;
  password: string;
};

export default function LoginUser({
  groupName,
  handleLoginUserSubmit,
  handleBack,
}: {
  groupName: string;
  handleLoginUserSubmit: (
    data: LoginUserForm,
    setError: UseFormSetError<LoginUserForm>
  ) => Promise<void>;
  handleBack: () => void;
}) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginUserForm>();

  const onSubmit: SubmitHandler<LoginUserForm> = async (data) =>
    await handleLoginUserSubmit(data, setError);

  return (
    <Box title={`Se connecter au groupe : ${groupName}`} className={`w-200`}>
      <form
        className="flex flex-col gap-y-10"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div id="FORM" className="grid grid-cols-[auto_1fr] gap-x-10 gap-y-5">
          <p className="text-xl text-left">Adresse mail</p>
          <div className="flex flex-col gap-y-2">
            <input
              type="email"
              {...register("email", {
                required: "Adresse mail requise",
                maxLength: {
                  value: 64,
                  message: "L'adresse mail doit faire au maximum 64 caractères",
                },
              })}
              className={`bg-white-500 text-black-500 text-left text-base px-3 py-1 rounded-lg outline-1 outline-beige-500`}
            />
            {errors.email && (
              <span className="text-red-500 text-sm">
                {errors.email.message}
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
                  message:
                    "Le mot de passe doit contenir au moins 10 caractères",
                },
                maxLength: {
                  value: 64,
                  message: "Le mot de passe ne peut pas dépasser 64 caractères",
                },
              })}
              className={`bg-white-500 text-black-500 text-left text-base px-3 py-1 rounded-lg outline-1 outline-beige-500`}
              type="password"
            />
            {errors.password && (
              <span className="text-red-500 text-sm">
                {errors.password.message}
              </span>
            )}
          </div>
        </div>

        <p className="text-xl text-left">
          Si vous avez oubliez votre mot de passe, contactez l’administrateur de
          votre groupe pour qu’il supprime votre compte.
        </p>
        <div id="BUTTONS" className="flex flex-row gap-x-5">
          <div className="grow">
            <SecondaryButton type="button" onClick={handleBack}>
              Retour
            </SecondaryButton>
          </div>
          <div className="flex flex-col gap-y-2 grow">
            <PrimaryButton type="submit">Connexion</PrimaryButton>

            {errors.root && (
              <span className="text-red-500 ">{errors.root.message}</span>
            )}
          </div>
        </div>
      </form>
    </Box>
  );
}
