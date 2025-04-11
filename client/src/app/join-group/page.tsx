'use client'
import Register from "@/components/Register";
import Join from "@/components/Join";
import Login from "@/components/Login";
import { useState } from "react";


export default function JoinGroup() {
  const [email, setEmail] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [groupName, setGroupName] = useState("Groupe de Noël");
    return (
      <div className='flex h-screen justify-center items-center'>
        <Login
          email={email}
          password={password}
          groupName={groupName}
        />
      </div>
    );
  }
  