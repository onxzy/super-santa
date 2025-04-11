import React from 'react';
import type { User } from 'super-santa-sdk/dist/api/dto/user.d.ts';
import Avatar from 'boring-avatars';

const UserCard : React.FC<User> = ({
  id,
  username,
  email,
  is_admin,
  wishes,
  created_at} ) => {
    return (
      <div className='flex items-center px-5 gap-x-5'>
        <Avatar
          size={50}
          name={id}
          variant="beam"
          colors={["#FF3C44", "#DDBC97", "#38A95C", "#FAF1F2", "#110506"]}
        />
        <p className='text-xl'>{username}</p>
      </div>
    );
  };
  
  export default UserCard;