import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import InventoryMenu from '../components/InventoryMenu';
import type { Item } from '../api/items';
import {
    create as createItem,
    list as fetchItems,
    remove as deleteItem,
    use as useItem,
} from '../api/items';

const Inventory = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('General');
    const [quantity, setQuantity] = useState('1');
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
        setQuantity('1');
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
        const parsedQuantity = Number.parseInt(quantity, 10);
        if (Number.isNaN(parsedQuantity) || parsedQuantity < 1) {
            setFormError('Quantity must be a positive number');
            return;
        }
        setSubmitting(true);
        try {
            const item = await createItem({
                name: name.trim(),
                description: description.trim() ? description.trim() : undefined,
                category: category.trim() ? category.trim() : undefined,
                quantity: parsedQuantity,
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

    const handleUse = async (itemId: number) => {
        const target = items.find((item) => item.id === itemId);
        if (!target || target.quantity <= 0) {
            alert('Item has no remaining quantity');
            return;
        }
        try {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const updated = await useItem(itemId);
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
                <h1>Inventory</h1>
                <button type="button" onClick={openDialog}>Add Item</button>
            </div>
            <InventoryMenu items={items} onDelete={handleDelete} onUse={handleUse} />
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
                            Quantity
                            <input
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                style={{ display: 'block', width: '100%', marginTop: '0.25rem' }}
                                disabled={submitting}
                                type="number"
                                min="1"
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

export default Inventory;
