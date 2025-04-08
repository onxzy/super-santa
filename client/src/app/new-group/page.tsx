<<<<<<< HEAD
'use client'
import { useRouter } from 'next/navigation'
import Input from '@/components/Input';
import { useState } from 'react';


export default function NewGroup() {
  const [groupName, setGroupName] = useState('');

  return (
      <div>
        <h1>Rudolphe</h1>
        <p>Créer un nouveau groupe</p>
        <Input
        type="text"
        placeholder="Nom du groupe"
        value={groupName}
        onChange={(e) => {setGroupName(e.target.value);}}
      />
=======
import Button from "@/components/Button";
import { useState } from "react";


export default function NewGroup() {
  enum Stepenum{NewGroup, NewGroup2}
  const [group, nextGroup] = useState(0)
  return (
    <div>
      {/* <h1>Rudolphe</h1> */}
      <h2>Créer un nouveau groupe</h2>
      <div>
        <div>Nom du groupe</div><input type="text"/>
        <div>Mot de passe</div><input type="text"/>
        <div>Vérification</div><input type="text"/>
>>>>>>> 20e7798 (init)
      </div>
      <div>Ce mot de passe sera demandé à chaque participant pour se connecter au groupe. Notez le bien, vous ne pourrez plus le modifier.</div>
      <Button
      text="Suivant"
      onClick={() => nextGroup(group)}
    />
    </div>
  );
}

export function NewGroup2() {
  return (
    <div>
      {/* <h1>Rudolphe</h1> */}
      <h2>Créer un nouveau groupe</h2>
      <div>
        <div>1</div><div>Invitez les participants en leur partagant le lien de connexion au groupe visible dans le panneau d’administration.</div>
        <div>2</div><div>Une fois tout vos participants inscrits, procédez au tirage depuis votre pannel d’administration</div>
        <div>3</div><div>Les participants pourrons découvrir la personne qui leur a été assignée depuis leur compte</div>
      </div>
      <Button
      text="Suivant"
      onClick={() => router.push('/new-group')} /* /new-group ?? */
    />
    </div>
  );
}
  