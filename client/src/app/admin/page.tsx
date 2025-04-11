'use client'

import Image from 'next/image';
import type { User } from 'super-santa-sdk/dist/api/dto/user.d.ts';
import { useState } from 'react';
import AccentButton from '@/components/AccentButton';
import {TbClipboardText} from  "react-icons/tb";
import UserBar from '@/components/UserBar';

export default function Dashboard() {

  const users:User[] = [
    {
      id: "1",
      username: "Noah",
      email:"noah@mail.com",
      is_admin: true,
      wishes: "Un livre de science-fiction captivant. Une tasse originale pour le café. Un jeu de société amusant à partager. Des chaussettes douillettes et colorées.",
      created_at: new Date("2025-04-04T12:00:00Z"),
    },

    {
      id: "2",
      username: "Thomas",
      email: "thomaskjndmcnxlmqlm@mail.com",
      is_admin: false,
      wishes: "Dune, Peepoodoo,Gagner au Not Alone, Se faire payer 6000€",
      created_at: new Date("2025-04-05T12:00:00Z"),
    },

    {
      id: "3",
      username: "Marc-Antoine",
      email: "marcantoinejhfizdhandclsgzekefhel@mail.com",
      is_admin: false,
      wishes: "Un vélo de triathlon, Savoir mentir au SecretH, Commencer après le début de son stage",
      created_at: new Date("2025-04-06T12:00:00Z"),
    }
  
  ];

  const [wishList, setWhishList] = useState<string>("Un livre de science-fiction captivant. Une tasse originale pour le café. Un jeu de société amusant à partager. Des chaussettes douillettes et colorées.");
  const [santaKnows, setSantaKnows] = useState<boolean>(false);

    return (
      <div className='flex flex-col'>
        
        <div id='HEADER' className='flex px-10 py-5 gap-x-10 justify-end'>
          <button className='text-base hover:underline cursor-pointer'>Espace utilisateur</button>
          <button className='text-base hover:underline cursor-pointer'>Se déconnecter</button>
        </div>
        
        <div id='TITLE' className='flex justify-center pt-10 pb-5'>
          <div className= 'flex flex-col gap-y-5'>
            <h1 className="font-serif text-6xl text-center">Maison du Père Noël</h1>
            <p className='text-xl text-center'>Ici, vérifiez la liste des enfants sages ayant le droit à un cadeau, et lancez le tirage</p>
          </div>
        </div>

        <div id='SANTA' className="px-40">

            <div className="py-10 pl-27 pr-20 relative flex">
                <Image
                src="/serveur.png"
                alt="Rudolphe"
                width={200}
                height={221}
                className='absolute top-0 left-0 -scale-x-100 drop-shadow-[-4px_8px_8px_rgba(0,0,0,0.25)]'
                />

                <div id="RECTANGLE" className="flex flex-col pl-25 pr-5 py-5 grow outline-1 rounded-xl outline-beige-500 shadow-sm-beige">
                    <div id='COL_ADMIN' className='flex flex-col gap-y-5 '>
                        <div id='ROW_DRAW' className='flex gap-x-10 justify-between pr-30 items-center'>
                            <p className='text-2xl font-extrabold text-left'>Tout le monde est prêt ?</p>
                            <div id='DRAW' className='flex flex-col gap-y-2'>
                                <AccentButton 
                                    text="Effectuer le tirage"
                                    onClick={() => {}}
                                ></AccentButton>
                                <p className='text-base text-center'>Attention, cette action est irréversible !</p>
                            </div>
                        </div>

                        <div id='COL_LINK' className='flex flex-col gap-y-3 p-3 bg-beige-500 rounded-2xl'>
                            <p className='text-xl text-left'>Lien à partager à tes amis pour qu’ils participent :</p>
                            <div id='LINK' className='flex justify-between items-center gap-x-10 py-3 px-5 bg-white-500 rounded-2xl'>
                                <p className='text-base text-left'>https://www.rennes.fr/secret-santa</p>
                                <button className='cursor-pointer text-beige-500 text-3xl'>
                                    <TbClipboardText />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div id='MEMBER_LIST' className='flex flex-col px-20 py-10 gap-y-10'>
            <p className='text-2xl font-extrabold text-center'>Participants</p>

            <div id='LIST' className='flex flex-col gap-y-5'>
                {users.map((user) => (
                    <UserBar
                        key={user.id}
                        id={user.id}
                        username={user.username}
                        email={user.email}
                        is_admin={user.is_admin}
                        wishes={user.wishes}
                        created_at={user.created_at}
                    />
                ))}
            </div>

        </div>
    </div>

    )}