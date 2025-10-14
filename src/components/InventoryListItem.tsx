import type { Item } from '../api/items';

type InventoryListItemProps = {
    item: Item;
};

const InventoryListItem = ({ item }: InventoryListItemProps) => (
    <div className="inventory-list-item">
        <h2>{item.name}</h2>
        <p>Category: {item.category}</p>
        <p>Quantity: {item.quantity}</p>
        {item.description ? <p>{item.description}</p> : <p>No description provided.</p>}
    </div>
);

export default InventoryListItem;
