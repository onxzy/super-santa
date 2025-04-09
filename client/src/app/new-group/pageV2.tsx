'use client'
import { useRouter } from 'next/navigation'
import Input from '@/components/Input';
import { ReactNode, useState } from 'react';
import PrimaryButton from '@/components/PrimaryButton';
import Display from '@/components/Display';

export default function NewGroup() {
  const router = useRouter();
  const [groupName, setGroupName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [step1, setStep1] = useState(true);
  const [step2, setStep2] = useState(false);

  
  return (<div>
    <Display
        title='hello'
        ifSecondaryButton
        >


        <Input
            type="text"
            placeholder="Nom du groupe"
            value={groupName}
            onChange={(e) => { setGroupName(e.target.value); }}
          />

    </Display>
    </div>

  );
}