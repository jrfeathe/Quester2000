export type Quest = {
    id: number;
    title: string;
    details: string | null;
    createdAt: string;
};

const BASE = "http://localhost:3000";

export async function list(): Promise<Quest[]> {
    const r = await fetch(`${BASE}/api/quests`, {
        credentials: "include",
    });
    if (!r.ok) {
        const message = await r
            .json()
            .then((body) => body?.error as string | undefined)
            .catch(() => undefined);
        throw new Error(message || "Unable to load quests");
    }
    return r.json();
}
