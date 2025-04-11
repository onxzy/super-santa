'use client'

import Image from 'next/image';
import UserCard from '@/components/UserCard';
import type { User } from 'super-santa-sdk/dist/api/dto/user.d.ts';
import Input from '@/components/Input';
import { useState } from 'react';
import AccentButton from '@/components/AccentButton';

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
      email: "thomas@mail.com",
      is_admin: false,
      wishes: "Dune, Peepoodoo,Gagner au Not Alone, Se faire payer 6000€",
      created_at: new Date("2025-04-05T12:00:00Z"),
    },

    {
      id: "3",
      username: "James",
      email: "james@mail.com",
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
          <button className='text-base hover:underline cursor-pointer'>Espace administration</button>
          <button className='text-base hover:underline cursor-pointer'>Se déconnecter</button>
        </div>
        
        <div id='TITLE' className='flex justify-center pt-10 pb-5'>
          <div className= 'flex flex-col gap-y-5'>
            <h1 className="font-serif text-6xl text-center">Rudolphe</h1>
            <p className='text-xl text-center'>Enfin un Père Noël Secret vraiment secret ! <br/> Offrez ce que vous voulez, personne ne saura que c’est vous.</p>
          </div>
        </div>

        <div id='SANTA' className="px-40">

          <div className="pt-10 pl-25 relative flex">
            <Image
              src="/renne.png"
              alt="Rudolphe"
              width={174}
              height={225}
              className='absolute top-0 left-0 -scale-x-100 drop-shadow-[-4px_8px_8px_rgba(0,0,0,0.25)]'
            />

            <div id="RECTANGLE" className="flex flex-col grow outline-1 rounded-xl outline-beige-500 shadow-sm-beige">
              <div id="NAME_BOX" className="flex flex-col p-5 gap-y-5 rounded-t-xl bg-beige-500">
                <div id="PHRASE" className="flex pl-15">
                <p className='text-2xl text-left font-extrabold'>Tu es le père Noël de :</p>
                </div>
                <div id="NAME" className="flex pl-15 py-3 rounded-xl bg-white-500">
                    <p className='text-4xl text-left font-serif'>
                    {santaKnows ? "Noah" : "01100010110100011110101101101"}
                    </p>
                  
                </div>
              </div>

                {santaKnows ? (
                  <div id='LIST' className='flex flex-col p-5 gap-y-3'>
                    <p className='text-xl text-left'>Sa liste au Père Noël :</p>
                    <p className='text-xl text-left'>  
                      1. Un livre de science-fiction captivant. <br/>
                      2. Une tasse originale pour le café. <br />
                      3. Un jeu de société amusant à partager.<br/>
                      4. Des chaussettes douillettes et colorées.<br/>
                    </p>
                  </div>
                ) : (
                  <div id='LIST' className='flex flex-col p-5 gap-y-3'>
                  <p className='text-xl text-center'>
                  Tu sera informé par mail quand l’administrateur aura fait le tirage.
                  </p>
                  </div>
                )}


            </div>
          </div>
        </div>

        <div id='MEMBERS' className='flex flex-col gap-y-10 px-20 py-10'>
          <p className='text-2xl text-center font-extrabold'>Participants</p>
          <div id='MEMBER_LIST' className='grid grid-cols-6 gap-x-5'>
            {users.map((user) => (
              <UserCard
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

        <div id='SETTINGS_BOX' className='flex justify-center py-10 px-20'>
          <div id='SETTINGS' className='flex flex-col items-center p-10 gap-y-5 rounded-xl outline-1 outline-beige-500 shadow-sm-beige'>
            <p className='text-2xl text-center font-extrabold'>Mes paramètres</p>
            <div id='ROW' className='grid grid-cols-2 gap-x-10'>
              <div id='LEFT' className='flex flex-col gap-y-5'>
                <div id='INFO' className='grid grid-cols-[auto_1fr] gap-x-10 gap-y-5'>
                  <p className='text-xl text-left'>Adresse mail</p>
                  <Input
                    type="email"
                    placeholder="Adresse mail"
                    value="noah@mail.com"
                    onChange={() => {}}
                    disabled={true}
                    className='text-white-700'
                  />
                  <p className='text-xl text-left'>Pseudo</p>
                  <Input
                    type="text"
                    placeholder="Pseudo"
                    value="Noah"
                    onChange={() => {}}
                    disabled={true}
                    className='text-white-700'
                  />
                </div>
                <button className='text-base text-red-500 text-center hover:underline cursor-pointer' onClick={()=>{setSantaKnows(false)}}>
                  Me retirer du tirage
                </button>
              </div>

              <div id='RIGHT' className='flex flex-col grow gap-y-3'>
                <p className='text-xl text-left'>Ma liste au Père Noël</p>
                <textarea
                  placeholder="Mes souhaits"
                  value={wishList}
                  onChange={(e) => {setWhishList(e.target.value)}}
                  className="h-25 bg-white-500 text-black-500 text-left text-base px-3 py-1 rounded-lg outline-1 outline-beige-500 "
                />
              </div>
            </div>

            <AccentButton
              text="Enregistrer"
              onClick={() => {setSantaKnows(true)}}
              className='w-1/3'
            />

          </div>
        </div>



      </div>
    );
  }
  