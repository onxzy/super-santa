import { createContext } from "react";
import { GroupInfo } from "super-santa-sdk/dist/api/dto/group";

export enum Status {
  LOADING = "LOADING",
  LOGIN_GROUP = "LOGIN_GROUP",
  LOGIN_USER = "LOGIN_USER",
  REGISTER = "REGISTER",
  DASHBOARD = "DASHBOARD",
}

export const GroupContext = createContext<GroupInfo>(null as any);
