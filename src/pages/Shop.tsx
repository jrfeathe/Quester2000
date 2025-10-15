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

const Shop = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('General');
    const [formError, setFormError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchItems()
            .then(setItems)
            .catch((err: Error) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const resetDialog = () => {
        setName('');
        setDescription('');
        setCategory('General');
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
        setSubmitting(true);
        try {
            const item = await createItem({
                name: name.trim(),
                description: description.trim() ? description.trim() : undefined,
                category: category.trim() ? category.trim() : undefined,
                quantity: 0,
            });
            setItems((prev) => [item, ...prev]);
            closeDialog();
        } catch (err) {
            setFormError((err as Error).message);
            setSubmitting(false);
        }
    };

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
        try {
            const updated = await buyItem(itemId);
            setItems((prev) =>
                prev.map((item) => (item.id === updated.id ? updated : item))
            );
        } catch (err) {
            alert((err as Error).message);
        }
    };

    if (loading) return <div>Loading items…</div>;
    if (error) return <div>Failed to load items: {error}</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Shop</h1>
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
