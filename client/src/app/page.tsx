'use client'

import Image from 'next/image';
import { useRouter } from 'next/navigation'
import PrimaryButton from '@/components/PrimaryButton';
import { useEffect, useState } from 'react';


export default function Home() {
  const router = useRouter();

  return (
    <div id='HOME'>

      <div id='HEADER' className='flex py-5 gap-x-10 justify-center'>
        <a href='#METHOD' className='text-base'>Comment ça marche ?</a>
        <a href='#Q&A' className='text-base'>FAQ</a>
        <a href='#ABOUT' className='text-base'>À Propos</a>
      </div>

      <div id='TITLE' className='flex px-25'>
        <div className= 'flex flex-col justify-end gap-y-5 grow pb-15'>
          <h1 className="font-serif text-6xl">Rudolphe</h1>
          <p className='text-xl'>Enfin un Père Noël Secret vraiment secret ! <br />
           Offrez ce que vous voulez, personne ne saura que c’est vous.</p>
          <div id='BUTTON'>
            <PrimaryButton
              text="En avant"
              onClick={() => router.push('/new-group')}
            />
          </div>
        </div>

        <Image
        src="/renne.png"
        alt="Rudolphe"
        width={421}
        height={544}
        className="h-max"
        priority
        />
      </div>

      <div id='BODY' className='flex items-center flex-col gap-y-20 pt-20'>

        <div id='XMAS' className='flex px-10 py-5 flex-col bg-beige-500 shadow-sm-beige rounded-lg'>
          <p className='text-2xl text-left font-extrabold'>Noël arrive !</p>
          <p className='text-xl text-left'>Est ce que tes cadeaux sont prêt ?</p>
        </div>

        <div id='METHOD' className='flex px-25 gap-x-10'>
          <Image
            src="/serveur.png"
            alt="Serveur"
            width={309}
            height={391}
            className="h-max"
          />

          <div id='METHOD_TEXT' className='flex flex-col gap-y-10 py-10 grow'>
            <p className='text-2xl text-left font-extrabold'>Comment ça vraiment secret ?</p>
            <p className='text-xl text-justify'>
              Notre technologie permet d’assurer que personne d’autre que vous ne sache à qui vous offrez votre cadeau. Nous utilisons un chiffrement de bout en bout ainsi qu’un algorithme révolutionnaire pour répartir les participants sans que nous ni l’organisateur ne puisse connaître la répartition. <br />
              <br />
              Lorsque vous créez un groupe vous devrez renseigner un mot de passe qui sera utilisé pour chiffrer les échanges entre les membres du groupe. Nous utilisons le protocole SRP pour vérifier vous authentifier sans que vous ne nous le communiquiez, de cette façon nous ne pourrons jamais déchiffrer vos échanges. Chaque participant devra ensuite créer un compte dans le groupe, nous utiliserons encore le protocole SRP pour l’authentifier sans qu’il nous transmette son mot de passe. <br />
              <br />
              Ensuite chaque participant génère un couple clé privée - clé publique à partir de son mot de passe personnel puis transmet sa clé publique chiffré avec le mot de passe du groupe. Nous chiffrons sa clé publique de cette manière pour garantir que le serveur ne puisse pas associer la clé publique d’un participant avec son identifiant. <br />
              <br />
              Une fois que tous les participants se sont enregistrés sur le groupe l’administrateur va ensuite pouvoir lancer le tirage qui se déroule de la façon suivante : <br />
              <br />
              1 - Le serveur construit une liste de couples [identifiant, clé publique (chiffrée)] dans un ordre aléatoire puis envoie à l’administrateur du groupe uniquement la liste des clés publiques. Il conserve en mémoire l’ordre de sa liste d’identifiants pour l’étape 3. <br />
              <br />
              2 - L’administrateur déchiffre la liste des clés publiques à l’aide du mot de passe du groupe puis décale les éléments de cette liste d’au plus le nombre de participants dans le groupe. Comme il ne connais pas l’association identifiant - clé publique (à part la sienne) il ne peut pas choisir les associations. Il envoie enfin la liste décalée des clé publique en clair au serveur. <br />
              <br />
              3 - Le serveur aligne ensuite cette liste avec sa liste d’identifiants de l’étape 1 et construit donc une nouvelle liste de couple [identifiant, clé publique]. Le décalage de l’étape 2 permet de construire un cycle et évite donc que quelqu’un soit attribué à lui même. <br />
              <br />
              4 - Le serveur chiffre chaque couple avec la clé publique du couple puis envoie cette nouvelle liste à tous les participants. <br />
              <br />
              5 - Chaque participant essaye ensuite de déchiffrer chaque ligne de cette liste avec sa clé privée, et ne pourra donc déchiffrer que la ligne avec sa clé publique et le participant qui lui a été attribué.
            </p>
          </div>
        </div>

        <div id='Q&A' className='bg-green-100 px-25 py-12'>
          <div id='Q&A_TEXT' className='flex flex-col gap-y-10'>

            <p className='text-2xl text-center font-extrabold'>Foire aux Questions</p>

            <div id='Q&A GRID' className='grid grid-cols-2 gap-x-10 gap-y-10'>
          

              <div id='Q&A_1_A' className='flex flex-col'>
              <p className='text-xl text-left font-extrabold'>Est ce que tout le monde recevra un cadeau ?</p>
              <p className='text-xl text-justify'>
              Pas d’inquiétude ! Notre algorithme s’assure que tous les participants se voient attribuer une personne à qui offrir un cadeau.
              </p>
              </div>

              <div id='Q&A_1_B' className='flex flex-col'>
              <p className='text-xl text-left font-extrabold'>Une personne peut-elle être attribuée à elle-même ?</p>
              <p className='text-xl text-jusitfy'>
              Heureusement non, la répartition se fait grace à un cycle, de cette façon il n’est pas possible qu’une personne se retrouve à devoir s’offrir un cadeau à elle-même
              </p>
              </div>

              <div id='Q&A_2_A' className='flex flex-col'>
              <p className='text-xl text-left font-extrabold'>Est ce que je peux retirer un participant du tirage ?</p>
              <p className='text-xl text-justify'>
              Oui, en tant qu’organisateur vous pouvez gérer les participants à votre guise et faire le tirage quand vous le souhaitez.              
              </p>
              </div>

              <div id='Q&A_2_B' className='flex flex-col'>
              <p className='text-xl text-left font-extrabold'>Il y a-t-il un nombre maximum de participants ?</p>
              <p className='text-xl text-justify'>
              Non, cependant pour pouvoir faire un tirage vous devez au moins être 3 dans le groupe, sinon ça n’aurait pas trop d’intérêt.              
              </p>
              </div>

              <div id='Q&A_3_A' className='flex flex-col'>
              <p className='text-xl text-left font-extrabold'>Comment savoir à qui je dois offrir mon cadeau ?</p>
              <p className='text-xl text-justify'>
              Une fois le tirage effectué par l’organisateur vous pourrez retrouver le nom de la personne qui vous a été attribué dans votre espace. Vous recevrez également un mail pour vous prévenir.              </p>
              </div>

              <div id='Q&A_3_B' className='flex flex-col'>
              <p className='text-xl text-left font-extrabold'>Comment savoir quel est le budget ?</p>
              <p className='text-xl text-justify'>
              Quand vous aurez rejoint le groupe, vous pourrez consulter les informations indiquées par votre organisateur. S’il a indiqué un budget vous pourrez le voir.              </p>
              </div>
            </div>
          </div>
        </div>

        <div id='ABOUT' className='flex flex-col gap-y-10 px-25'>
          <p className='text-2xl text-center font-extrabold'>À Propos</p>
          <p className='text-xl text-justify'>
          Ce site a été conçu par un groupe d’étudiants en cybersécurité dans le cadre d’un projet universitaire portant sur la sécurité web.<br /><br />

          L’objectif ? Repenser le concept du Père Noël Secret en le rendant réellement... secret. Inspirés par la vidéo de <strong>Stand-up Maths</strong> intitulée <em>“Existe-t-il un Père Noël secret zéro confiance parfait ?”</em>, nous avons voulu relever le défi : créer une application où la confidentialité des échanges et l’anonymat des participants sont garantis, même pour l’organisateur.<br /><br />

          En combinant des protocoles de cryptographie avancée, comme le <strong>chiffrement de bout en bout</strong> et le protocole <strong>SRP</strong>, nous avons imaginé un système dans lequel personne — pas même le serveur — ne peut connaître les associations entre les participants d’un tirage.<br /><br />

          Ce projet est à la fois une expérience technique autour du concept <strong>zero trust</strong> et une manière ludique de sensibiliser aux enjeux de la sécurité des données personnelles.<br /><br />

          En somme, un Père Noël Secret... sans fuite de secrets.
          </p>
        </div>

      </div>



    </div>
    
  );
}
