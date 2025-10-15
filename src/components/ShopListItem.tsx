import type { Item } from '../api/items';

type ShopListItemProps = {
    item: Item;
};

const ShopListItem = ({ item }: ShopListItemProps) => (
    <div className="shop-list-item">
        <h2>{item.title}</h2>
        <p>Category: {item.category}</p>
        <p>Quantity: {item.quantity}</p>
        {item.description ? <p>{item.description}</p> : <p>No description provided.</p>}
    </div>
);

export default ShopListItem;
