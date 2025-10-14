import InventoryListItem from './InventoryListItem';
import type { Item } from '../api/items';

type InventoryMenuProps = {
    items: Item[];
    onDelete?: (id: number) => void;
    onUse?: (id: number) => void;
};

const InventoryMenu = ({ items, onDelete, onUse }: InventoryMenuProps) => (
    <main>
        {items.length === 0 ? (
            <p>No items found yet.</p>
        ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {items.map((item) => (
                    <li key={item.id} style={{ margin: '1rem 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
                            <InventoryListItem item={item} />
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                                <button
                                    type="button"
                                    onClick={() => onUse?.(item.id)}
                                    disabled={item.quantity <= 0}
                                >
                                    Use
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

export default InventoryMenu;
