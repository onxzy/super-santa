import Box from "./Box";
import PrimaryButton from "./PrimaryButton";
import { useForm, SubmitHandler } from "react-hook-form";


  export interface LoginProps {

    groupName: string;
    className?: string;

  }

  type LoginForm = {
    email: string;
    password: string;
  }

const Login : React.FC<LoginProps> = ({groupName,className}) => {
    const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    } = useForm<LoginForm>()
        
    const onSubmit: SubmitHandler<LoginForm> = (data) => console.log(data)
    

    return(
        <Box title={`Se connecter au groupe : ${groupName}`} className={`w-200 ${className}`}>
            <form className="flex flex-col gap-y-10" onSubmit={handleSubmit(onSubmit)}>
                <div id="FORM" className="grid grid-cols-[auto_1fr] gap-x-10 gap-y-5">
                <p className="text-xl text-left">Adresse mail</p>
                <input type="email" {...register("email", ({ required: true, maxLength: 64 }))}
                className={`bg-white-500 text-black-500 text-left text-base px-3 py-1 rounded-lg outline-1 outline-beige-500`}
                />

                <p className="text-xl text-left">Mot de passe</p>
                <input
                    {...register("password", ({ required: true, minLength: 10, maxLength: 64 }))}
                    className={`bg-white-500 text-black-500 text-left text-base px-3 py-1 rounded-lg outline-1 outline-beige-500`}
                    type="password"
                />

                </div>  

                <p className="text-xl text-left">Si vous avez oubliez votre mot de passe, contactez l’administrateur de votre groupe pour qu’il supprime votre compte.</p>
                <PrimaryButton
                    text="Connexion"
                    type="submit"
                />

                
            </form>

            
        </Box>
      )
}

export default Login;