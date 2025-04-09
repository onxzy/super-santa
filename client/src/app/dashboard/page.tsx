import Image from 'next/image';

export default function Dashboard() {
    return (
      <div>
        
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
                  <p className='text-4xl text-left font-serif'>Noah</p>
                </div>
              </div>

              <div id='LIST' className='flex flex-col p-5 gap-y-3 '>
                <p className='text-xl text-left'>Sa liste au Père Noël :</p>

                <p className='text-xl text-left'>  
                1. Un livre de science-fiction captivant. <br/>
                2. Une tasse originale pour le café. <br />
                3. Un jeu de société amusant à partager.<br/>
                4. Des chaussettes douillettes et colorées.<br/>
                </p>
              </div>

            </div>

            <div id='MEMBERS' className='flex flex-col gap-y-10 px-20 py-10'>
              <p className='text-2xl text-center font-extrabold'>Participants</p>
              <div id='MEMBER_LIST' className='grid grid-cols-6 gap-x-5'>
              </div>

            </div>

          </div>
        </div>









      </div>
    );
  }
  