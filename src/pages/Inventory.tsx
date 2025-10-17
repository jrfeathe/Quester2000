import { useEffect, useState } from 'react';
import InventoryMenu from '../components/InventoryMenu';
import UserPointsSummary from '../components/UserPointsSummary';
import ItemDesigner, { type ItemDesignerResult } from '../components/ItemDesigner';
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
    const [pointsRefreshKey, setPointsRefreshKey] = useState(0);

    useEffect(() => {
        fetchItems()
            .then(setItems)
            .catch((err: Error) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const closeDialog = () => {
        setDialogOpen(false);
    };

    const openDialog = () => {
        setDialogOpen(true);
    };

    const handleCreateItem = async (values: ItemDesignerResult) => {
        const item = await createItem({
            name: values.name,
            description: values.description,
            category: values.category,
            quantity: values.quantity ?? 1,
        });
        setItems((prev) => [item, ...prev]);
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
            setPointsRefreshKey((prev) => prev + 1);
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
                    <h1 style={{ marginBottom: '0.25rem' }}>Inventory</h1>
                    <UserPointsSummary
                        refreshKey={pointsRefreshKey}
                        style={{ margin: 0, fontSize: '0.9rem', color: '#ccc' }}
                    />
                </div>
                <button type="button" onClick={openDialog}>Add Item</button>
            </div>
            <InventoryMenu items={items} onDelete={handleDelete} onUse={handleUse} />
            <ItemDesigner
                isOpen={isDialogOpen}
                heading="Add Item"
                includeQuantity
                onClose={closeDialog}
                onSubmit={handleCreateItem}
            />
        </div>
    );
};

export default Inventory;
