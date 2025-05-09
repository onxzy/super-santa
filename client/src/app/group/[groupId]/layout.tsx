"use client";

import { APIContext, b64uEncode } from "@/app/APIContext";
import { useContext, useEffect, useState } from "react";
import { GroupInfo } from "super-santa-sdk/dist/api/dto/group";
import { useParams, useRouter } from "next/navigation";
import LoginGroup, { LoginGroupForm } from "@/components/form/LoginGroup";
import { UseFormSetError } from "react-hook-form";
import { AuthAPIError, AuthAPIErrorCode } from "super-santa-sdk/dist/api/auth";
import Register, { RegisterForm } from "@/components/form/Register";
import LoginUser from "@/components/form/LoginUser";
import { useToast } from "@/app/ToastContext";
import Image from "next/image";
import { Status, GroupContext } from "./GroupContext";

export default function GroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { showToast } = useToast();

  const [status, setStatus] = useState<Status>(Status.LOADING);
  const { api, authLoading, authContext, setAuthContext } =
    useContext(APIContext);
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);

  const { groupId } = useParams<{ groupId: string }>();

  useEffect(() => {
    const fetchGroupInfo = async () => {
      try {
        const group = await api.getGroupInfo(groupId);
        if (group) {
          setGroupInfo(group);
        } else {
          return router.replace("/");
        }
      } catch {
        return router.replace("/");
      }
    };

    fetchGroupInfo();

    return () => {
      setGroupInfo(null);
    };
  }, [groupId]);

  useEffect(() => {
    if (authLoading || !groupInfo) return;

    if (authContext) {
      if (authContext.group.id != groupInfo.id)
        router.replace(`/group/${authContext.group.id}`);
      setStatus(Status.DASHBOARD);
    } else setStatus(Status.LOGIN_GROUP);

    return () => {
      setStatus(Status.LOADING);
    };
  }, [groupInfo, authLoading, authContext]);

  const handleLoginGroupSubmit = async (
    data: LoginGroupForm,
    next: "login" | "register",
    setError: UseFormSetError<LoginGroupForm>
  ) => {
    try {
      await api.loginGroup(groupId, data.secret);
      window.location.hash = `#${b64uEncode(data.secret)}`;
    } catch (error) {
      if (error instanceof AuthAPIError) {
        if (error.code == AuthAPIErrorCode.BAD_SECRET) {
          return setError("secret", {
            type: "BAD_SECRET",
            message: "Mot de passe incorrect",
          });
        }
      }
      return setError("root", {
        type: "UNKNOWN_ERROR",
        message: "Une erreur est survenue",
      });
    }
    setStatus(next == "login" ? Status.LOGIN_USER : Status.REGISTER);
  };

  const handleLoginUserSubmit = async (
    data: { email: string; password: string },
    setError: UseFormSetError<{ email: string; password: string }>
  ) => {
    try {
      const user = await api.loginUser(data.email, data.password);
      const group = await api.getGroup();

      setAuthContext({ user, group });
      setStatus(Status.DASHBOARD);
      showToast(`Connexion réussie ! Bienvenue ${user.username}`, "success");
    } catch (error) {
      if (error instanceof AuthAPIError) {
        switch (error.code) {
          case AuthAPIErrorCode.BAD_EMAIL:
            setError("email", {
              type: "BAD_EMAIL",
              message: "Utilisateur inconnu",
            });
            break;
          case AuthAPIErrorCode.BAD_PASSWORD:
            setError("password", {
              type: "BAD_PASSWORD",
              message: "Mot de passe incorrect",
            });
            break;
          case AuthAPIErrorCode.GROUP_AUTH_ERROR:
            showToast(
              "Erreur d'authentification au groupe. Veuillez vous reconnecter au groupe.",
              "error"
            );
            setStatus(Status.LOGIN_GROUP);
            break;
        }
      } else {
        setError("root", {
          type: "UNKNOWN_ERROR",
          message: "Une erreur est survenue",
        });
      }
      return;
    }
  };

  const handleRegisterSubmit = async (
    data: RegisterForm,
    setError: UseFormSetError<RegisterForm>
  ) => {
    try {
      const { group, user } = await api.joinGroup(
        data.pseudo,
        data.email,
        data.password
      );

      setAuthContext({ user, group });
      setStatus(Status.DASHBOARD);
    } catch (error) {
      setError("root", {
        type: "UNKNOWN_ERROR",
        message: "Une erreur est survenue",
      });
      return;
    }
  };

  return status == Status.LOADING ? (
    <div className="flex flex-col h-screen justify-center items-center">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-t-red-500 border-r-green-500 border-b-beige-500 border-l-green-500 animate-spin"></div>
        <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
          <Image
            src="/compressed/renne.png"
            alt="Reindeer"
            height={54 * 0.8}
            width={42 * 0.8}
          />
        </div>
      </div>
      <span className="mt-4 text-sm font-serif text-black-500">
        Préparation des cadeaux...
      </span>
    </div>
  ) : status == Status.DASHBOARD && authContext && groupInfo ? (
    <GroupContext.Provider value={groupInfo}>{children}</GroupContext.Provider>
  ) : (
    <div className="flex flex-col h-screen justify-center items-center">
      {status == Status.LOGIN_GROUP ? (
        <LoginGroup
          groupName={groupInfo!.name}
          handleLoginGroupSubmit={handleLoginGroupSubmit}
        />
      ) : status == Status.LOGIN_USER ? (
        <LoginUser
          groupName={groupInfo!.name}
          handleLoginUserSubmit={handleLoginUserSubmit}
          handleBack={() => setStatus(Status.LOGIN_GROUP)}
        />
      ) : status == Status.REGISTER ? (
        <Register
          groupName={groupInfo!.name}
          handleRegisterSubmit={handleRegisterSubmit}
          handleBack={() => setStatus(Status.LOGIN_GROUP)}
        />
      ) : (
        <span>Error</span>
      )}
    </div>
  );
}
