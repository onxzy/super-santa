'use client'
import { useRouter } from 'next/navigation'
import CreateGroup from '@/components/CreateGroup';
import Register from '@/components/Register';
import { use, useState } from 'react';
import GroupInfo from '@/components/GroupInfo';
import { PreCreateGroupProps } from '@/components/CreateGroup';
import { set } from 'react-hook-form';

enum Step {
  NAME = 'NAME',
  TUTO = 'TUTO',
  ADMIN = 'ADMIN',
}



export default function NewGroup() {
  const router = useRouter();
  const [step, setStep] = useState(Step.NAME);
  const [PreCreateGroupData, setPreCreateGroupData] = useState<PreCreateGroupProps | null>(null);

  const handleCreateGroupSubmit = (data: PreCreateGroupProps) => {
    console.log(data);
    setPreCreateGroupData(data);
    setStep(Step.TUTO);
  }

  const handleCreateInfoSubmit = () => {
    setStep(Step.ADMIN);
  }

  
  return (
    <div className='flex h-screen justify-center items-center'>

      { step==Step.NAME ? 
          <CreateGroup handleCreateGroupSubmit={handleCreateGroupSubmit}/>  

        : step==Step.TUTO ?
          <GroupInfo handleCreateInfoSubmit={handleCreateGroupSubmit}/>

        : step==Step.ADMIN ?
          <Register
            groupName="Rudolphe"
          />

        : <span>Erreur</span>
      }

    </div>
  );
}