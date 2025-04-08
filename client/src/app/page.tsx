'use client'

import { useRouter } from 'next/navigation'
import PrimaryButton from '@/components/PrimaryButton';


export default function Home() {
  const router = useRouter();
  return (
    <div>
      <h1>Rudolphe</h1>
      <p>Page d'accueil</p>
      <PrimaryButton
        text="Créer un nouveau groupe"
        onClick={() => router.push('/new-group')}
      />
    </div>
  );
}
