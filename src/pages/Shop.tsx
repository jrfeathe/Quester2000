import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import ShopMenu from '../components/ShopMenu';
import type { Item } from '../api/items';
import {
    create as createItem,
    list as fetchItems,
    remove as deleteItem,
    buy as buyItem,
} from '../api/items';
import type { PointsBalance } from '../api/user';
import { getPoints } from '../api/user';

const Shop = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('General');
    const [priceBody, setPriceBody] = useState('0');
    const [priceMind, setPriceMind] = useState('0');
    const [priceSoul, setPriceSoul] = useState('0');
    const [formError, setFormError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [points, setPoints] = useState<PointsBalance | null>(null);

    useEffect(() => {
        Promise.all([fetchItems(), getPoints()])
            .then(([loadedItems, loadedPoints]) => {
                setItems(loadedItems);
                setPoints(loadedPoints);
            })
            .catch((err: Error) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const resetDialog = () => {
        setName('');
        setDescription('');
        setCategory('General');
        setPriceBody('0');
        setPriceMind('0');
        setPriceSoul('0');
        setFormError(null);
        setSubmitting(false);
    };

    const closeDialog = () => {
        setDialogOpen(false);
        resetDialog();
    };

    const openDialog = () => {
        setFormError(null);
        setDialogOpen(true);
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!name.trim()) {
            setFormError('Item name is required');
            return;
        }
        const parsedPriceBody = Number(priceBody);
        if (!Number.isFinite(parsedPriceBody) || parsedPriceBody < 0 || !Number.isInteger(parsedPriceBody)) {
            setFormError('Body price must be a non-negative integer');
            return;
        }
        const parsedPriceMind = Number(priceMind);
        if (!Number.isFinite(parsedPriceMind) || parsedPriceMind < 0 || !Number.isInteger(parsedPriceMind)) {
            setFormError('Mind price must be a non-negative integer');
            return;
        }
        const parsedPriceSoul = Number(priceSoul);
        if (!Number.isFinite(parsedPriceSoul) || parsedPriceSoul < 0 || !Number.isInteger(parsedPriceSoul)) {
            setFormError('Soul price must be a non-negative integer');
            return;
        }
        setSubmitting(true);
        try {
            const item = await createItem({
                name: name.trim(),
                description: description.trim() ? description.trim() : undefined,
                category: category.trim() ? category.trim() : undefined,
                quantity: 0,
                priceBody: parsedPriceBody,
                priceMind: parsedPriceMind,
                priceSoul: parsedPriceSoul,
            });
            setItems((prev) => [item, ...prev]);
            closeDialog();
        } catch (err) {
            setFormError((err as Error).message);
            setSubmitting(false);
        }
    };

    const getCostBreakdown = (item: Item): PointsBalance => ({
        pointsBody: item.priceBody > 0 ? item.priceBody : 0,
        pointsMind: item.priceMind > 0 ? item.priceMind : 0,
        pointsSoul: item.priceSoul > 0 ? item.priceSoul : 0,
    });

    const handleDelete = async (itemId: number) => {
        const confirmed = window.confirm('Delete this item?');
        if (!confirmed) return;

        try {
            await deleteItem(itemId);
            setItems((prev) => prev.filter((item) => item.id !== itemId));
        } catch (err) {
            alert((err as Error).message);
        }
    };

    const handleBuy = async (itemId: number) => {
        const target = items.find((item) => item.id === itemId);
        if (!target) {
            alert('Item target not found');
            return;
        }
        const cost = getCostBreakdown(target);
        try {
            const updated = await buyItem(itemId);
            setItems((prev) =>
                prev.map((item) => (item.id === updated.id ? updated : item))
            );
            if (cost.pointsBody > 0 || cost.pointsMind > 0 || cost.pointsSoul > 0) {
                setPoints((prev) => {
                    if (!prev) return prev;
                    return {
                        pointsBody: Math.max(0, prev.pointsBody - cost.pointsBody),
                        pointsMind: Math.max(0, prev.pointsMind - cost.pointsMind),
                        pointsSoul: Math.max(0, prev.pointsSoul - cost.pointsSoul),
                    };
                });
            }
        } catch (err) {
            alert((err as Error).message);
        }
    };

    if (loading) return <div>Loading items…</div>;
    if (error) return <div>Failed to load items: {error}</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ marginBottom: '0.25rem' }}>Shop</h1>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#ccc' }}>
                        {points
                            ? `Body ${points.pointsBody} · Mind ${points.pointsMind} · Soul ${points.pointsSoul}`
                            : 'Loading points…'}
                    </p>
                </div>
                <button type="button" onClick={openDialog}>Add Item</button>
            </div>
            <ShopMenu items={items} onDelete={handleDelete} onBuy={handleBuy} />
            {isDialogOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="add-item-heading"
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1rem',
                    }}
                >
                    <form
                        onSubmit={handleSubmit}
                        style={{ background: '#223', padding: '1.5rem', borderRadius: '0.5rem', minWidth: '280px' }}
                    >
                        <h2 id="add-item-heading" style={{ marginTop: 0 }}>Add Item</h2>
                        {formError ? <p style={{ color: 'red' }}>{formError}</p> : null}
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                            Name
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                style={{ display: 'block', width: '100%', marginTop: '0.25rem' }}
                                disabled={submitting}
                            />
                        </label>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                            Description (optional)
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                style={{ display: 'block', width: '100%', marginTop: '0.25rem' }}
                                disabled={submitting}
                                rows={4}
                            />
                        </label>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                            Category (optional)
                            <input
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                style={{ display: 'block', width: '100%', marginTop: '0.25rem' }}
                                disabled={submitting}
                                placeholder="General"
                            />
                        </label>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                            Body price
                            <input
                                type="number"
                                min="0"
                                step="1"
                                value={priceBody}
                                onChange={(e) => setPriceBody(e.target.value)}
                                style={{ display: 'block', width: '100%', marginTop: '0.25rem' }}
                                disabled={submitting}
                            />
                        </label>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                            Mind price
                            <input
                                type="number"
                                min="0"
                                step="1"
                                value={priceMind}
                                onChange={(e) => setPriceMind(e.target.value)}
                                style={{ display: 'block', width: '100%', marginTop: '0.25rem' }}
                                disabled={submitting}
                            />
                        </label>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                            Soul price
                            <input
                                type="number"
                                min="0"
                                step="1"
                                value={priceSoul}
                                onChange={(e) => setPriceSoul(e.target.value)}
                                style={{ display: 'block', width: '100%', marginTop: '0.25rem' }}
                                disabled={submitting}
                            />
                        </label>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <button type="button" onClick={closeDialog} disabled={submitting}>Cancel</button>
                            <button type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Save'}</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Shop;
