'use client'
import { useRouter } from 'next/navigation'
import CreateGroup from '@/components/CreateGroup';
import Register from '@/components/Register';
import { useState } from 'react';
import GroupInfo from '@/components/GroupInfo';
import { PreCreateGroupProps } from '@/components/CreateGroup';
import { RegisterForm } from '@/components/Register';
import { useContext } from 'react';
import { APIContext } from '@/app/APIContext';
import { SuperSantaAPIError, SuperSantaAPIErrorCode } from 'super-santa-sdk';
import { ApiError } from 'super-santa-sdk/dist/api/client';
import { UseFormSetError } from 'react-hook-form';


enum Step {
  NAME = 'NAME',
  TUTO = 'TUTO',
  ADMIN = 'ADMIN',
}



export default function NewGroup() {
  const router = useRouter();
  const [step, setStep] = useState(Step.NAME);
  const [PreCreateGroupData, setPreCreateGroupData] = useState<PreCreateGroupProps | null>(null);
  const [registerData, setRegisterData] = useState<RegisterForm | null>(null);
  const santaAPI = useContext(APIContext)!;

  const handleCreateGroupSubmit = (data: PreCreateGroupProps) => {
    console.log("CreateGroupForm : ",data);
    setPreCreateGroupData(data);
    setStep(Step.TUTO);
  }

  const handleGroupInfoSubmit = () => {
    setStep(Step.ADMIN);
  }

  const  handleRegisterSubmit = async (data: RegisterForm, setError: UseFormSetError<RegisterForm> ) => {
    console.log("RegisterForm : ",data);
    setRegisterData(data);
    if (PreCreateGroupData) {
      try {
        const {group, user}= await santaAPI.api.createGroup(PreCreateGroupData.groupName, PreCreateGroupData.password,{ email:data.email, username:data.pseudo, password:data.password})
      } catch (error) {
        if (error instanceof SuperSantaAPIError) {
          if (error.code === SuperSantaAPIErrorCode.BAD_CRYPTO_CONTEXT) {
            console.error("BAD_CRYPTO_CONTEXT");
            setError("password", { type: "manual", message: "Déjà authentifié" });
          }

        }
        if (error instanceof ApiError) {
          if (error.status == 400) {
            console.error("BAD_REQUEST");
            setError("root.serverError", { type: "400", message: "Bad Request" });
          }
        }
      }
    }
  }
  
  return (
    <div className='flex flex-col h-screen justify-center items-center'>

      { step==Step.NAME ? 
          <CreateGroup handleCreateGroupSubmit={handleCreateGroupSubmit}/>  

        : step==Step.TUTO ?
          <GroupInfo handleGroupInfo={handleGroupInfoSubmit}/>

        : step==Step.ADMIN ?
          <Register
            groupName={PreCreateGroupData!.groupName}
            handleRegisterSubmit={handleRegisterSubmit}
          />

        : <span>Erreur</span>
      }



    </div>
  );
}