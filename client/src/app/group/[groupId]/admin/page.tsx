"use client";

import Image from "next/image";
import type { User } from "super-santa-sdk/dist/api/dto/user.d.ts";
import { useContext, useState } from "react";
import AccentButton from "@/components/ui/AccentButton";
import { TbClipboardText } from "react-icons/tb";
import UserBar from "@/components/ui/UserBar";
import { useRouter } from "next/navigation";
import { APIContext, AuthContext, b64uEncode } from "@/app/APIContext";
import Link from "next/link";
import { GroupContext } from "../layout";
import { useToast } from "@/app/ToastContext";
import {
  GroupAPIError,
  GroupAPIErrorCode,
} from "super-santa-sdk/dist/api/group";
import { SuperSantaAPIError, SuperSantaAPIErrorCode } from "super-santa-sdk";

export default function AdminDashboard() {
  const router = useRouter();

  const groupInfo = useContext(GroupContext);
  const { api, logout, authContext, refreshAuthContext } =
    useContext(APIContext);
  const { showToast } = useToast();

  if (!authContext) return;

  if (!authContext.user.is_admin)
    return router.replace(`/group/${groupInfo.id}`);

  const [isDrawing, setIsDrawing] = useState(false);
  const handleDraw = async () => {
    setIsDrawing(true);
    try {
      await api.draw();
      await refreshAuthContext();
      showToast("Tirage effectué avec succès !", "success");
    } catch (error) {
      if (error instanceof GroupAPIError) {
        if (error.code === GroupAPIErrorCode.NOT_ENOUGH_USERS) {
          showToast(
            "Il n'y a pas assez de participants pour effectuer le tirage.",
            "error"
          );
        }
      } else if (error instanceof SuperSantaAPIError) {
        if (error.code === SuperSantaAPIErrorCode.BAD_DRAW) {
          showToast(
            "Erreur lors du tirage : l'un des participants est corrompu",
            "error"
          );
        }
      } else {
        showToast(`Une erreur inattendue est survenue lors du tirage`, "error");
      }
    } finally {
      setIsDrawing(false);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      await api.deleteUser(userId);
      await refreshAuthContext();
      showToast("L'utilisateur a été supprimé avec succès !", "success");
    } catch (error) {
      showToast(
        `Une erreur est survenue lors de la suppression de l'utilisateur`,
        "error"
      );
    }
  };

  let shareLink = `${window.location.protocol}//${window.location.host}/group/${authContext.group.id}${window.location.hash}`;

  return (
    <div className="flex flex-col">
      <div id="HEADER" className="flex px-10 py-5 gap-x-10 justify-end">
        <Link href="./">
          <button className="text-base hover:underline cursor-pointer">
            Espace utilisateur
          </button>
        </Link>

        <button
          className="text-base hover:underline cursor-pointer"
          onClick={() => logout()}
        >
          Se déconnecter
        </button>
      </div>

      <div id="TITLE" className="flex justify-center pt-10 pb-5">
        <div className="flex flex-col gap-y-5">
          <h1 className="font-serif text-6xl text-center">
            Maison du Père Noël
          </h1>
          <p className="text-xl text-center">
            Ici, vérifiez la liste des enfants sages ayant le droit à un cadeau,
            et lancez le tirage
          </p>
        </div>
      </div>

      <div id="SANTA" className="px-40">
        <div className="py-10 pl-27 pr-20 relative flex">
          <Image
            src="/serveur.png"
            alt="Rudolphe"
            width={200}
            height={221}
            className="absolute top-0 left-0 -scale-x-100 drop-shadow-[-4px_8px_8px_rgba(0,0,0,0.25)]"
          />

          <div
            id="RECTANGLE"
            className="flex flex-col pl-25 pr-5 py-5 grow outline-1 rounded-xl outline-beige-500 shadow-sm-beige"
          >
            <div id="COL_ADMIN" className="flex flex-col gap-y-5 ">
              {!authContext.group.results && (
                <div
                  id="ROW_DRAW"
                  className="flex gap-x-10 justify-between pr-30 items-center"
                >
                  <p className="text-2xl font-extrabold text-left">
                    Tout le monde est prêt ?
                  </p>
                  <div id="DRAW" className="flex flex-col gap-y-2">
                    <AccentButton onClick={handleDraw} disabled={isDrawing}>
                      {isDrawing ? "Tirage en cours..." : "Effectuer le tirage"}
                    </AccentButton>
                    <p className="text-base text-center">
                      Attention, cette action est irréversible !
                    </p>
                  </div>
                </div>
              )}

              <div
                id="COL_LINK"
                className="flex flex-col gap-y-3 p-3 bg-beige-500 rounded-2xl"
              >
                <p className="text-xl text-left">
                  Lien à partager à tes amis pour qu'ils participent :
                </p>
                <div
                  id="LINK"
                  className="flex justify-between items-center bg-white-500 rounded-2xl"
                >
                  <input
                    // disabled={true}
                    className="text-base text-left py-3 px-5 w-full"
                    value={shareLink}
                    onFocus={(e) => e.target.select()}
                  />
                  <button
                    className="cursor-pointer text-beige-500 text-3xl px-2"
                    onClick={() => {
                      const value = shareLink;
                      navigator.clipboard.writeText(value);
                      showToast(
                        "Lien copié dans le presse-papier !",
                        "success"
                      );
                    }}
                  >
                    <TbClipboardText />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="MEMBER_LIST" className="flex flex-col px-20 py-10 gap-y-10">
        <p className="text-2xl font-extrabold text-center">Participants</p>

        <div id="LIST" className="flex flex-col gap-y-5">
          {authContext.group.users.map((user) => (
            <UserBar
              key={user.id}
              id={user.id}
              username={user.username}
              email={user.email}
              is_admin={user.is_admin}
              wishes={user.wishes}
              created_at={user.created_at}
              handleDelete={handleRemoveUser}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
