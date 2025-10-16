export type PointsBalance = {
    pointsBody: number;
    pointsMind: number;
    pointsSoul: number;
};

const BASE = 'http://localhost:3000';

export async function getPoints(): Promise<PointsBalance> {
    const r = await fetch(`${BASE}/api/user/points`, {
        credentials: 'include',
    });
    if (!r.ok) {
        const message = await r
            .json()
            .then((body) => body?.error as string | undefined)
            .catch(() => undefined);
        throw new Error(message || 'Unable to load points');
    }
    return r.json();
}
