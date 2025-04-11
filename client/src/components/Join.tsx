import Box from "./Box";
import PrimaryButton from "./PrimaryButton";
import Input from "./Input";
import SecondaryButton from "./SecondaryButton";


  export interface JoinProps {

    password: string;
    groupName: string;
    className?: string;

  }

const Join : React.FC<JoinProps> = ({password,groupName,className}) => {

    return(
        <Box title={`Rejoindre le groupe : ${groupName}`} className={`w-125 ${className}`}>

            <div id="FORM" className="flex flex-col gap-y-3 ">
                <p className="text-xl text-left">Mot de passe du groupe</p>
                <Input
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => { password = e.target.value; }}
                />
            </div>
            
            <div id="BUTTONS" className="flex flex-col gap-y-5">
                <SecondaryButton
                    text="Connexion"
                    onClick={() => {}}
                />

                <PrimaryButton
                    text="S'inscrire"
                    onClick={() => {}}
                />
            </div>
            
        </Box>
      )
}

export default Join;