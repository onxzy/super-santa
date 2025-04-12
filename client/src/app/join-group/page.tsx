'use client'
import Register from "@/components/Register";
import Join from "@/components/Join";
import Login from "@/components/Login";



export default function JoinGroup() {
    return (
      <div className='flex h-screen justify-center items-center'>

        {/* <Join groupName="Groupe 1"/> */}

        {/* <Login groupName="Groupe 1"/> */}

        <Register groupName="Groupe 1"/>
 

      </div>
    );
  }
  