import PrimaryButton from "@/components/PrimaryButton"; 
import { useState, createContext} from "react";
import { useRouter } from 'next/navigation';

export function NewGroup2() {
  const router = useRouter();
    return (
      <div>
        {/* <h1>Rudolphe</h1> */}
        <h2>Créer un nouveau groupe</h2>
        <div>
          <div>1</div><div>Invitez les participants en leur partagant le lien de connexion au groupe visible dans le panneau d’administration.</div>
          <div>2</div><div>Une fois tout vos participants inscrits, procédez au tirage depuis votre pannel d’administration</div>
          <div>3</div><div>Les participants pourrons découvrir la personne qui leur a été assignée depuis leur compte</div>
        </div>
        <PrimaryButton
        text="Suivant"
        onClick={() => router.push('/new-group')} /* /new-group ?? */
      />
      </div>
    );
  }