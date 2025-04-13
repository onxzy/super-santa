import Box from "../ui/Box";
import PrimaryButton from "../ui/PrimaryButton";
import { useForm, SubmitHandler, UseFormSetError } from "react-hook-form";
import SecondaryButton from "../ui/SecondaryButton";
import { b64uDecode } from "@/app/APIContext";

export type LoginGroupForm = {
  secret: string;
};

export default function LoginGroup({
  groupName,
  handleLoginGroupSubmit,
}: {
  groupName: string;
  handleLoginGroupSubmit: (
    data: LoginGroupForm,
    next: "login" | "register",
    setError: UseFormSetError<LoginGroupForm>
  ) => Promise<void>;
}) {
  const { hash } = window.location;
  const secret = b64uDecode(hash.replace("#", ""));
  console.log(secret);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginGroupForm>({
    defaultValues: {
      secret,
    },
  });

  return (
    <Box title={`Rejoindre le groupe : ${groupName}`} className="w-125">
      <form className="flex flex-col gap-y-10 " id="FORM">
        <div className="flex flex-col gap-y-3">
          <p className="text-xl text-left">Mot de passe du groupe</p>

          <input
            {...register("secret", {
              required: "Le mot de passe est requis",
              minLength: {
                value: 4, // FIXME:
                message: "Le mot de passe doit contenir au moins 10 caractères",
              },
              maxLength: {
                value: 64,
                message: "Le mot de passe ne peut pas dépasser 64 caractères",
              },
            })}
            type="password"
            className={`bg-white-500 text-black-500 text-left text-base px-3 py-1 rounded-lg outline-1 outline-beige-500`}
          />
          {errors.secret && (
            <span className="text-red-500 text-sm text-center">
              {errors.secret.message}
            </span>
          )}
        </div>

        <div id="BUTTONS" className="flex flex-col gap-y-5">
          {/* Gérer les 2 submits différents */}
          <SecondaryButton
            type="submit"
            onClick={handleSubmit(
              async (data) =>
                await handleLoginGroupSubmit(data, "login", setError)
            )}
          >
            Connexion
          </SecondaryButton>

          <PrimaryButton
            type="submit"
            onClick={handleSubmit(
              async (data) =>
                await handleLoginGroupSubmit(data, "register", setError)
            )}
          >
            S'inscrire
          </PrimaryButton>
        </div>
      </form>
    </Box>
  );
}
