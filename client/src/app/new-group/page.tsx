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
      </div>
    );
  }
  