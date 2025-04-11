import Box from "./Box";
import PrimaryButton from "./PrimaryButton";
import Input from "./Input";


  export interface LoginProps {

    email: string;
    password: string;
    groupName: string;
    className?: string;

  }

const Register : React.FC<LoginProps> = ({email,password,groupName,className}) => {

    return(
        <Box title={`Se connecter au groupe : ${groupName}`} className={`w-200 ${className}`}>
            <div id="FORM" className="grid grid-cols-[auto_1fr] gap-x-10 gap-y-5">
                <p className="text-xl text-left">Adresse mail</p>
                <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => { email = e.target.value; }}
                />

                <p className="text-xl text-left">Mot de passe</p>
                <Input
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => { password = e.target.value; }}
                />

                
            </div>

            <p className="text-xl text-left">Si vous avez oubliez votre mot de passe, contactez l’administrateur de votre groupe pour qu’il supprime votre compte.</p>
            <PrimaryButton
                text="Connexion"
                onClick={() => {}}
            />
        </Box>
      )
}

export default Register;