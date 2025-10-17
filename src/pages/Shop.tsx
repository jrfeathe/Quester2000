import { useEffect, useState } from 'react';
import ShopMenu from '../components/ShopMenu';
import UserPointsSummary from '../components/UserPointsSummary';
import ItemDesigner, { type ItemDesignerResult } from '../components/ItemDesigner';
import type { Item } from '../api/items';
import {
    create as createItem,
    list as fetchItems,
    remove as deleteItem,
    buy as buyItem,
} from '../api/items';
import type { PointsBalance } from '../api/user';

const Shop = () => {
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
            quantity: 0,
            priceBody: values.priceBody ?? 0,
            priceMind: values.priceMind ?? 0,
            priceSoul: values.priceSoul ?? 0,
        });
        setItems((prev) => [item, ...prev]);
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
                setPointsRefreshKey((prev) => prev + 1);
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
                    <UserPointsSummary
                        refreshKey={pointsRefreshKey}
                        style={{ margin: 0, fontSize: '0.9rem', color: '#ccc' }}
                    />
                </div>
                <button type="button" onClick={openDialog}>Add Item</button>
            </div>
            <ShopMenu items={items} onDelete={handleDelete} onBuy={handleBuy} />
            <ItemDesigner
                isOpen={isDialogOpen}
                heading="Add Item"
                includePricing
                onClose={closeDialog}
                onSubmit={handleCreateItem}
            />
        </div>
    );
};

export default Shop;
