"use client";
import { useRouter } from "next/navigation";
import CreateGroup from "@/components/form/CreateGroup";
import Register from "@/components/form/Register";
import { useState } from "react";
import GroupInfo from "@/components/form/GroupInfo";
import { PreCreateGroupProps } from "@/components/form/CreateGroup";
import { RegisterForm } from "@/components/form/Register";
import { useContext } from "react";
import { APIContext, b64uEncode } from "@/app/APIContext";
import { ApiError } from "super-santa-sdk/dist/api/client";
import { UseFormSetError } from "react-hook-form";
import { useToast } from "@/app/ToastContext";

enum Step {
  NAME = "NAME",
  TUTO = "TUTO",
  ADMIN = "ADMIN",
}

export default function NewGroup() {
  const router = useRouter();
  const { showToast } = useToast();

  const { api, setAuthContext } = useContext(APIContext);

  const [step, setStep] = useState(Step.NAME);
  const [PreCreateGroupData, setPreCreateGroupData] =
    useState<PreCreateGroupProps | null>(null);

  const handleCreateGroupSubmit = (data: PreCreateGroupProps) => {
    console.log("CreateGroupForm : ", data);
    setPreCreateGroupData(data);
    setStep(Step.TUTO);
  };

  const handleGroupInfoSubmit = () => {
    setStep(Step.ADMIN);
  };

  const handleRegisterSubmit = async (
    data: RegisterForm,
    setError: UseFormSetError<RegisterForm>
  ) => {
    console.log("RegisterForm : ", data);
    if (PreCreateGroupData) {
      try {
        const { group, user } = await api.createGroup(
          PreCreateGroupData.groupName,
          PreCreateGroupData.password,
          { email: data.email, username: data.pseudo, password: data.password }
        );
        setAuthContext({ user, group });
        showToast(`Groupe "${group.name}" créé avec succès !`, "success");
        router.push(
          `/group/${group.id}#${b64uEncode(PreCreateGroupData.password)}`
        );
      } catch (error) {
        if (error instanceof ApiError) {
          if (error.status == 400) {
            console.error("BAD_REQUEST");
            setError("root.serverError", {
              type: "400",
              message: "Bad Request",
            });
          }
        }
        setError("root", {
          type: "unknown",
          message: "Erreur inconnue",
        });
      }
    }
  };

  return (
    <div className="flex flex-col h-screen justify-center items-center">
      {step == Step.NAME ? (
        <CreateGroup handleCreateGroupSubmit={handleCreateGroupSubmit} />
      ) : step == Step.TUTO ? (
        <GroupInfo handleGroupInfo={handleGroupInfoSubmit} />
      ) : step == Step.ADMIN ? (
        <Register
          groupName={PreCreateGroupData!.groupName}
          handleRegisterSubmit={handleRegisterSubmit}
        />
      ) : (
        <span>Erreur</span>
      )}
    </div>
  );
}
