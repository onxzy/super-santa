import Box from "./Box";
import PrimaryButton from "./PrimaryButton";
import Input from "./Input";


  export interface RegisterProps {

    email: string;
    pseudo: string;
    password: string;
    passwordConfirm: string;
    groupName: string;
    className?: string;

  }

const Register : React.FC<RegisterProps> = ({email,pseudo,password,passwordConfirm,groupName,className}) => {

    return(
        <Box title={`Rejoindre le groupe : ${groupName}`} className={`w-200 ${className}`}>
            <div id="FORM" className="grid grid-cols-[auto_1fr] gap-x-10 gap-y-5">
                <p className="text-xl text-left">Adresse mail</p>
                <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => { email = e.target.value; }}
                />

                <p className="text-xl text-left">Pseudo</p>
                <Input
                    type="text"
                    placeholder="Pseudo"
                    value={pseudo}
                    onChange={(e) => { pseudo = e.target.value; }}
                />

                <p className="text-xl text-left">Mot de passe</p>
                <Input
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => { password = e.target.value; }}
                />

                <p className="text-xl text-left">Vérification</p>
                <Input
                    type="password"
                    placeholder="Vérification"
                    value={passwordConfirm}
                    onChange={(e) => { passwordConfirm = e.target.value; }}
                />
            </div>

            <p className="text-xl text-left">Ce mot de passe, vous sera demandé pour vous connecter au groupe. Si vous l’oubliez vous ne pourrez plus vous connecter et vous devrez recréer un compte.</p>

            <PrimaryButton
                text="Rejoindre"
                onClick={() => {}}
            />
        </Box>
      )
}

export default Register;