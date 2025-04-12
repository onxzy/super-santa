import Box from "./Box";
import PrimaryButton from "./PrimaryButton";
import { useForm, SubmitHandler } from "react-hook-form";
import SecondaryButton from "./SecondaryButton";


export interface JoinProps {

    groupName: string;
    className?: string;

  }

type JoinForm = {
    password: string;
}

const Join : React.FC<JoinProps> = ({groupName,className}) => {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
      } = useForm<JoinForm>()
    const onSubmit: SubmitHandler<JoinForm> = (data) => console.log(data)

    return(
        <Box title={`Rejoindre le groupe : ${groupName}`} className={`w-125 ${className}`}>

            <form className="flex flex-col gap-y-10 " onSubmit={handleSubmit(onSubmit)} id="FORM">

                <div className="flex flex-col gap-y-3">
                <p className="text-xl text-left">Mot de passe du groupe</p>
                
                <input {...register("password", ({ required: true, minLength: 10, maxLength: 64 }))}
                type="password"
                className={`bg-white-500 text-black-500 text-left text-base px-3 py-1 rounded-lg outline-1 outline-beige-500`}
                />
                </div>
            
                <div id="BUTTONS" className="flex flex-col gap-y-5">
                {/* Gérer les 2 submits différents */}
                    <SecondaryButton
                        text="Connexion"
                        type="submit"
                    />

                    <PrimaryButton
                        text="S'inscrire"
                        type="submit"
                    />
                </div>
            </form>           
        </Box>
      )
}

export default Join;