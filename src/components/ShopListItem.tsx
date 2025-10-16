import type { Item } from '../api/items';

type ShopListItemProps = {
    item: Item;
};

const ShopListItem = ({ item }: ShopListItemProps) => {
    const parts: string[] = [];
    if (item.priceBody > 0) parts.push(`${item.priceBody} Body`);
    if (item.priceMind > 0) parts.push(`${item.priceMind} Mind`);
    if (item.priceSoul > 0) parts.push(`${item.priceSoul} Soul`);
    const costLabel = parts.length > 0 ? parts.join(' · ') : 'Free';

    return (
        <div className="shop-list-item">
            <h2>{item.title}</h2>
            <p>Category: {item.category}</p>
            <p>Quantity: {item.quantity}</p>
            <p>Cost: {costLabel}</p>
            {item.description ? <p>{item.description}</p> : <p>No description provided.</p>}
        </div>
    );
};

export default ShopListItem;
