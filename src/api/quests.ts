import type { Item } from './items';

export type Quest = {
    id: number;
    title: string;
    details: string | null;
    createdAt: string;
    completed: boolean;
    group: string;
    rewardBody: number;
    rewardMind: number;
    rewardSoul: number;
    rewardItems: Item[];
};

export type CreateQuestInput = {
    title: string;
    details?: string;
    group?: string;
    rewardBody?: number;
    rewardMind?: number;
    rewardSoul?: number;
    rewardItemIds?: number[];
};

const BASE = 'http://localhost:3000';

export async function list(): Promise<Quest[]> {
    const r = await fetch(`${BASE}/api/quests`, {
        credentials: "include",
    });
    if (!r.ok) {
        const message = await r
            .json()
            .then((body) => body?.error as string | undefined)
            .catch(() => undefined);
        throw new Error(message || 'Unable to load quests');
    }
    return r.json();
}

export async function create(input: CreateQuestInput): Promise<Quest> {
    const r = await fetch(`${BASE}/api/quests`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    });
    if (!r.ok) {
        const message = await r
            .json()
            .then((body) => body?.error as string | undefined)
            .catch(() => undefined);
        throw new Error(message || 'Unable to create quest');
    }
    return r.json();
}

export async function remove(id: number): Promise<void> {
    const r = await fetch(`${BASE}/api/quests/${id}`, {
        method: 'DELETE',
        credentials: 'include',
    });
    if (!r.ok) {
        const message = await r
            .json()
            .then((body) => body?.error as string | undefined)
            .catch(() => undefined);
        throw new Error(message || 'Unable to delete quest');
    }
}

export async function updateCompletion(id: number, completed: boolean): Promise<Quest> {
    const r = await fetch(`${BASE}/api/quests/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
    });
    if (!r.ok) {
        const message = await r
            .json()
            .then((body) => body?.error as string | undefined)
            .catch(() => undefined);
        throw new Error(message || 'Unable to update quest');
    }
    return r.json();
}
