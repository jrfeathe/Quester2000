import React, { useEffect, useState } from "react";
import { Ctx, type AuthCtx, type Me } from "./Ctx";
import * as api from "../api/auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [me, setMe] = useState<Me>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.me().then(setMe).finally(() => setLoading(false));
    }, []);

    const value: AuthCtx = {
        me,
        loading,
        async register(u, p) { setMe(await api.register(u, p)); },
        async login(u, p) { setMe(await api.login(u, p)); },
        async logout() { await api.logout(); setMe(null); },
    };

    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
