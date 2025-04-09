'use client'
import { useRouter } from 'next/navigation'
import Input from '@/components/Input';
import { useState } from 'react';
import PrimaryButton from '@/components/PrimaryButton';

export default function NewGroup() {
  const router = useRouter();
  const [groupName, setGroupName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [step1, setStep1] = useState(true);
  const [step2, setStep2] = useState(false);

  
  return (
    <div className='flex h-screen justify-center items-center'>

      { step1 &&

      <div id='NEW_GROUP_STEP_1' className='flex flex-col gap-y-10 p-10 w-200 outline-1 outline-beige-500 rounded-xl shadow-sm-beige'>
        <p className='text-2xl text-center font-extrabold'>Créer un nouveau groupe</p>

        <div id='FORM' className='grid grid-cols-2 gap-x-5 gap-y-5'>
          <p className='text-xl text-left'>Nom du groupe</p>
          <Input
            type="text"
            placeholder="Nom du groupe"
            value={groupName}
            onChange={(e) => { setGroupName(e.target.value); }}
          />

          <p className='text-xl text-left'>Mot de passe</p>
          <Input
            type="password"
            placeholder="Mot de passe"  
            value={password}
            onChange={(e) => { setPassword(e.target.value); }}
          />

          <p className='text-xl text-left'>Vérification</p>
          <Input
            type="password"
            placeholder="Vérification"
            value={passwordConfirm}
            onChange={(e) => { setPasswordConfirm(e.target.value); }}
          />

        </div>

        <p className='text-xl text-left '>Ce mot de passe sera demandé à chaque participant pour se connecter au groupe. Notez le bien, vous ne pourrez pas le modifier.</p>
        
        <PrimaryButton
          text="Suivant"
          onClick={() => {setStep1(false); setStep2(true);}}
        />

      </div>

      }

      { step2 &&

      <div id='NEW_GROUP_STEP_2' className='flex flex-col gap-y-10 p-10 w-200 outline-1 outline-beige-500 rounded-xl shadow-sm-beige'>
        <p className='text-2xl text-center font-extrabold'>Créer un nouveau groupe</p>

        <div id='INFO' className='flex flex-col gap-y-5'>
          <div className='flex gap-x-5 items-center'>
            <p className='text-2xl text-left font-extrabold'>1</p>
            <p className='text-xl text-left grow'>Invitez les participants en leur partagant le lien de connexion au groupe visible dans le panneau d’administration.</p>
          </div>

          <div className='flex gap-x-5 items-center'>
          <p className='text-2xl text-left font-extrabold'>2</p>
          <p className='text-xl text-left'>Une fois tout vos participants inscrits, procédez au tirage depuis votre pannel d’administration</p>
          </div>

          <div className='flex gap-x-5 items-center'>
          <p className='text-2xl text-left font-extrabold'>3</p>
          <p className='text-xl text-left'>Les participants pourrons découvrir la personne qui leur a été assignée depuis leur compte</p>
          </div>

        </div>

        <PrimaryButton
          text="Suivant"
          onClick={() => {setStep1(true); setStep2(false);}}
        />
      </div>

      }


    </div>
  );
}


// export default function NewGroup() {
//   const [groupName, setGroupName] = useState('');

//   return (
//       <div>
//         <h1>Rudolphe</h1>
//         <p>Créer un nouveau groupe</p>
//         <Input
//         type="text"
//         placeholder="Nom du groupe"
//         value={groupName}
//         onChange={(e) => {setGroupName(e.target.value);}}
//       />
//       </div>
//       <div>Ce mot de passe sera demandé à chaque participant pour se connecter au groupe. Notez le bien, vous ne pourrez plus le modifier.</div>
//       <Button
//       text="Suivant"
//       onClick={() => nextGroup(group)}
//     />
//     </div>
//   );
// }

// export function NewGroup2() {
//   router
//   return (
//     <div>
//       {/* <h1>Rudolphe</h1> */}
//       <h2>Créer un nouveau groupe</h2>
//       <div>
//         <div>1</div><div>Invitez les participants en leur partagant le lien de connexion au groupe visible dans le panneau d’administration.</div>
//         <div>2</div><div>Une fois tout vos participants inscrits, procédez au tirage depuis votre pannel d’administration</div>
//         <div>3</div><div>Les participants pourrons découvrir la personne qui leur a été assignée depuis leur compte</div>
//       </div>
//       <PrimaryButton
//       text="Suivant"
//       onClick={() => router.push('/new-group')} /* /new-group ?? */
//     />
//     </div>
//   );
// }
  