import React from 'react';
import type { User } from 'super-santa-sdk/dist/api/dto/user.d.ts';
import Avatar from 'boring-avatars';

// Button component
const UserCard : React.FC<User> = ({
  id,
  username,
  email,
  is_admin,
  wishes,
  created_at} ) => {
    return (
      <div className='flex px-5 gap-x-5'>
        
        <p className='text-xl'>{username}</p>
      </div>
    );
  };
  
  export default UserCard;