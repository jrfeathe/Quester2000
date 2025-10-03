import { createContext } from "react";

export type Me = { id: number; username: string } | null;

export type AuthCtx = {
    me: Me;
    loading: boolean;
    register: (u: string, p: string) => Promise<void>;
    login: (u: string, p: string) => Promise<void>;
    logout: () => Promise<void>;
};

export const Ctx = createContext<AuthCtx | null>(null);
