import React from "react";
import type { User } from "super-santa-sdk/dist/api/dto/user.d.ts";
import { TbTrash } from "react-icons/tb";
import Avatar from "boring-avatars";

const UserCard: React.FC<
  User & { handleDelete: (userId: string) => Promise<void> }
> = ({ id, username, email, is_admin, wishes, created_at, handleDelete }) => {
  const [deleting, setDeleting] = React.useState(false);

  return (
    <div className="flex items-center px-5 py-3 gap-x-10 outline-1 outline-beige-500 rounded-xl">
      <Avatar
        size={50}
        name={id}
        variant="beam"
        colors={["#FF3C44", "#DDBC97", "#38A95C"]}
      />
      <div id="USERNAME" className="basis-1/6">
        <p className="text-xl grow-3">{username}</p>
      </div>
      <div id="EMAIL" className="basis-3/6">
        <p className="text-xl grow-2">{email}</p>
      </div>
      <div id="DATE" className="flex basis-2/6 gap-x-3">
        <p className="text-xl font-bold">depuis le :</p>
        <p className="text-xl">{new Date(created_at).toLocaleDateString()}</p>
      </div>
      <button
        className="rounded-full text-red-500 outline-1 p-2 outline-red-500 cursor-pointer shadow-sm-red hover:bg-red-500 hover:text-white transition-all duration-300 ease-in-out disabled:opacity-10 disabled:cursor-not-allowed"
        onClick={async () => {
          setDeleting(true);
          await handleDelete(id);
          setDeleting(false);
        }}
        disabled={is_admin || deleting}
      >
        <TbTrash size={30} />
      </button>
    </div>
  );
};

export default UserCard;
