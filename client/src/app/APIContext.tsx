"use client";
import { createContext, useEffect } from "react";
import { SuperSantaAPI } from "super-santa-sdk/dist/index.js";
import { useState } from "react";
import { GroupModel } from "super-santa-sdk/dist/api/dto/group";
import { UserSelf } from "super-santa-sdk/dist/api/dto/user";

export type AuthContext = {
  user: UserSelf;
  group: GroupModel;
};

export const b64uEncode = (str: string) => {
  const b64 = btoa(str);
  return b64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
};

export const b64uDecode = (str: string) => {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (b64.length % 4)) % 4);
  return atob(b64 + padding);
};

export const initAPIContext = () => {
  const [api, setAPI] = useState<SuperSantaAPI>(
    SuperSantaAPI.getInstance({
      apiHost: process.env.NEXT_PUBLIC_API_URL || "http://non:8080",
    })
  );
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authContext, setAuthContext] = useState<AuthContext | null>(null);

  const refreshAuthContext = async () => {
    if (!authContext) return;
    const user = await api.getUser();
    const group = await api.getGroup();
    setAuthContext({ user, group });
  };

  const logout = async () => {
    api.logout();
    setAuthContext(null);
  };

  useEffect(() => {
    const fetchAuthContext = async () => {
      setAuthLoading(true);
      const user = await api.auth();
      if (user) {
        const group = await api.getGroup();
        setAuthContext({ user, group });
      } else {
        setAuthContext(null);
      }
      setAuthLoading(false);
    };
    fetchAuthContext();
  }, [api]);

  return {
    api,
    authContext,
    setAuthContext,
    authLoading,
    refreshAuthContext,
    logout,
  };
};

export const APIContext = createContext<ReturnType<typeof initAPIContext>>(
  {} as any
);
