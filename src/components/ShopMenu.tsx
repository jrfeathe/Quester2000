import ShopListItem from './ShopListItem';
import type { Item } from '../api/items';

type ShopMenuProps = {
    items: Item[];
    onDelete?: (id: number) => void;
    onBuy?: (id: number) => void;
};

const ShopMenu = ({ items, onDelete, onBuy }: ShopMenuProps) => {
    const filteredItems = items;

    return (
        <main>
            {filteredItems.length === 0 ? (
                <p>No items found yet.</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {filteredItems.map((item) => (
                        <li key={item.id} style={{ margin: '1rem 0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
                                <ShopListItem item={item} />
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => onBuy?.(item.id)}
                                        //disabled={item.quantity <= 0}
                                    >
                                        Buy
                                    </button>
                                    {onDelete ? (
                                        <button type="button" onClick={() => onDelete(item.id)}>
                                            Delete
                                        </button>
                                    ) : null}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
};

export default ShopMenu;
