export type Item = {
    id: number;
    createdAt: string;
    title: string;
    icon: string | null;
    description: string | null;
    category: string;
    quantity: number;
    priceBody: number;
    priceMind: number;
    priceSoul: number;
    userId: number;
};

export type CreateItemInput = {
    name: string;
    description?: string;
    category?: string;
    quantity?: number;
    priceBody?: number;
    priceMind?: number;
    priceSoul?: number;
};

const BASE = 'http://localhost:3000';

export async function list(): Promise<Item[]> {
    const r = await fetch(`${BASE}/api/items`, {
        credentials: 'include',
    });
    if (!r.ok) {
        const message = await r
            .json()
            .then((body) => body?.error as string | undefined)
            .catch(() => undefined);
        throw new Error(message || 'Unable to load items');
    }
    return r.json();
}

export async function create(input: CreateItemInput): Promise<Item> {
    const r = await fetch(`${BASE}/api/items`, {
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
        throw new Error(message || 'Unable to create item');
    }
    return r.json();
}

export async function remove(id: number): Promise<void> {
    const r = await fetch(`${BASE}/api/items/${id}`, {
        method: 'DELETE',
        credentials: 'include',
    });
    if (!r.ok) {
        const message = await r
            .json()
            .then((body) => body?.error as string | undefined)
            .catch(() => undefined);
        throw new Error(message || 'Unable to delete item');
    }
}

export async function use(id: number): Promise<Item> {
    const r = await fetch(`${BASE}/api/items/${id}/use`, {
        method: 'POST',
        credentials: 'include',
    });
    if (!r.ok) {
        const message = await r
            .json()
            .then((body) => body?.error as string | undefined)
            .catch(() => undefined);
        throw new Error(message || 'Unable to use item');
    }
    return r.json();
}

export async function buy(id: number): Promise<Item> {
    const r = await fetch(`${BASE}/api/items/${id}/buy`, {
        method: 'POST',
        credentials: 'include',
    });
    if (!r.ok) {
        const message = await r
            .json()
            .then((body) => body?.error as string | undefined)
            .catch(() => undefined);
        throw new Error(message || 'Unable to buy item');
    }
    return r.json();
}
