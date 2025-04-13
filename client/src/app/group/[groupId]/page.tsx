"use client";

import Image from "next/image";
import UserCard from "@/components/ui/UserCard";
import type { User } from "super-santa-sdk/dist/api/dto/user.d.ts";
import Input from "@/components/ui/Input";
import { useContext, useEffect, useState } from "react";
import AccentButton from "@/components/ui/AccentButton";
import { APIContext, AuthContext } from "@/app/APIContext";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import MatrixPlaceholder from "@/components/ui/MatrixPlaceholder";
import {
  SuperSantaAPIError,
  SuperSantaAPIErrorCode,
} from "super-santa-sdk/dist/index";
import { useToast } from "@/app/ToastContext";

export default function UserDashboard() {
  const router = useRouter();
  const { showToast } = useToast();

  const [santa, setSanta] = useState<User | null>(null);

  const { api, logout, authContext, refreshAuthContext } =
    useContext(APIContext);

  if (!authContext) return;

  useEffect(() => {
    const fetchSanta = async () => {
      try {
        setSanta(await api.parseResult(authContext.group));
      } catch (error) {
        if (error instanceof SuperSantaAPIError) {
          if (error.code === SuperSantaAPIErrorCode.BAD_CRYPTO_CONTEXT) {
            showToast(
              "Erreur de chiffrement : contexte cryptographique invalide. Veuillez vous reconnecter.",
              "error"
            );
          } else if (error.code === SuperSantaAPIErrorCode.BAD_RESULT) {
            showToast(
              "Erreur lors de la récupération du résultat du tirage.",
              "error"
            );
          } else {
            showToast(
              `Erreur lors de la récupération du résultat : ${error.message}`,
              "error"
            );
          }
        } else if (error instanceof Error) {
          showToast(`Une erreur est survenue : ${error.message}`, "error");
        }
      }
    };
    fetchSanta();
  }, []);

  const [isChangingWishes, setIsChangingWishes] = useState(false);
  const [wishes, setWishes] = useState<string>(authContext.user.wishes);
  const handleChangeWishes = async () => {
    if (!wishes) return;

    setIsChangingWishes(true);
    try {
      await api.updateWishes(wishes);
      await refreshAuthContext();
      showToast("Vos souhaits ont été enregistrés !", "success");
    } catch (error) {
      showToast(
        "Une erreur est survenue lors de l'enregistrement des souhaits",
        "error"
      );
    } finally {
      setIsChangingWishes(false);
    }
  };

  const [isLeaving, setIsLeaving] = useState(false);
  const handleLeave = async () => {
    setIsLeaving(true);
    try {
      await api.leaveGroup();
      showToast("Vous avez quitté le groupe avec succès", "success");
      logout();
      router.push("/");
    } catch (error) {
      setIsLeaving(false);
      showToast("Une erreur est survenue lors de la suppression", "error");
    }
  };

  return (
    <div>
      <div id="HEADER" className="flex px-10 py-5 gap-x-10 justify-end">
        {authContext.user.is_admin && (
          <Link href={`/group/${authContext.group.id}/admin`}>
            <button className="text-base hover:underline cursor-pointer">
              Espace administration
            </button>
          </Link>
        )}
        <button
          className="text-base hover:underline cursor-pointer"
          onClick={() => logout()}
        >
          Se déconnecter
        </button>
      </div>

      <div id="TITLE" className="flex justify-center pt-10 pb-5">
        <div className="flex flex-col gap-y-5">
          <h1 className="font-serif text-6xl text-center">Rudolphe</h1>
          <p className="text-xl text-center">
            Enfin un Père Noël Secret vraiment secret ! <br /> Offrez ce que
            vous voulez, personne ne saura que c’est vous.
          </p>
        </div>
      </div>

      <div id="SANTA" className="px-40">
        <div className="pt-10 pl-25 relative flex">
          <Image
            src="/renne.png"
            alt="Rudolphe"
            width={174}
            height={225}
            className="absolute top-0 left-0 -scale-x-100 drop-shadow-[-4px_8px_8px_rgba(0,0,0,0.25)]"
          />

          <div
            id="RECTANGLE"
            className="flex flex-col grow outline-1 rounded-xl outline-beige-500 shadow-sm-beige"
          >
            <div
              id="NAME_BOX"
              className="flex flex-col p-5 gap-y-5 rounded-t-xl bg-beige-500"
            >
              <div id="PHRASE" className="flex pl-15">
                <p className="text-2xl text-left font-extrabold">
                  Tu es le père Noël de :
                </p>
              </div>
              <div
                id="NAME"
                className="flex pl-15 py-3 rounded-xl bg-white-500"
              >
                {santa ? (
                  <p className="text-4xl text-left font-serif">
                    {santa.username}
                  </p>
                ) : (
                  <MatrixPlaceholder className="w-full" />
                )}
              </div>
            </div>

            {santa ? (
              <div id="LIST" className="flex flex-col p-5 gap-y-3">
                <p className="text-xl text-left">Sa liste au Père Noël :</p>
                <p className="text-xl text-left">{santa.wishes}</p>
              </div>
            ) : (
              <div id="LIST" className="flex flex-col p-5 gap-y-3">
                <p className="text-xl text-center">
                  Tu sera informé par mail quand l’administrateur aura fait le
                  tirage.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div id="MEMBERS" className="flex flex-col gap-y-10 px-20 py-10">
        <p className="text-2xl text-center font-extrabold">Participants</p>
        <div
          id="MEMBER_LIST"
          className="flex flex-row gap-10 flex-wrap justify-center"
        >
          {authContext.group.users.map((user) => (
            <UserCard
              key={user.id}
              id={user.id}
              username={user.username}
              email={user.email}
              is_admin={user.is_admin}
              wishes={user.wishes}
              created_at={user.created_at}
            />
          ))}
        </div>
      </div>

      <div id="SETTINGS_BOX" className="flex justify-center py-10 px-20">
        <div
          id="SETTINGS"
          className="flex flex-col items-center p-10 gap-y-5 rounded-xl outline-1 outline-beige-500 shadow-sm-beige"
        >
          <p className="text-2xl text-center font-extrabold">Mes paramètres</p>
          <div id="ROW" className="grid grid-cols-2 gap-x-10">
            <div id="LEFT" className="flex flex-col gap-y-5">
              <div
                id="INFO"
                className="grid grid-cols-[auto_1fr] gap-x-10 gap-y-5"
              >
                <p className="text-xl text-left">Adresse mail</p>
                <Input
                  type="email"
                  placeholder="Adresse mail"
                  value={authContext.user.email}
                  onChange={() => {}}
                  disabled={true}
                  className="text-white-700"
                />
                <p className="text-xl text-left">Pseudo</p>
                <Input
                  type="text"
                  placeholder="Pseudo"
                  value={authContext.user.username}
                  onChange={() => {}}
                  disabled={true}
                  className="text-white-700"
                />
              </div>
              {!authContext.user.is_admin && (
                <button
                  className="text-base text-red-500 text-center hover:underline cursor-pointer"
                  onClick={handleLeave}
                  disabled={isLeaving}
                >
                  Me retirer du tirage
                </button>
              )}
            </div>

            <div id="RIGHT" className="flex flex-col grow gap-y-3">
              <p className="text-xl text-left">Ma liste au Père Noël</p>
              <textarea
                placeholder="Mes souhaits"
                value={wishes}
                onChange={(e) => setWishes(e.target.value)}
                disabled={isChangingWishes}
                className="h-25 bg-white-500 text-black-500 text-left text-base px-3 py-1 rounded-lg outline-1 outline-beige-500 "
              />
            </div>
          </div>

          <div className="w-1/3">
            <AccentButton
              onClick={handleChangeWishes}
              disabled={isChangingWishes}
            >
              Enregistrer
            </AccentButton>
          </div>
        </div>
      </div>
    </div>
  );
}
