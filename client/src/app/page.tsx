'use client'
 
import { useRouter } from 'next/navigation'
import Button from '@/components/Button';

export default function Home() {
  const router = useRouter();
  return (
    <div>
      <h1>Rudolphe</h1>
      <p>Page d'accueil</p>
      <Button
        text="Créer un nouveau groupe"
        onClick={() => router.push('/new-group')}
      />
    </div>
  );
}
