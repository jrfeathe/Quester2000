import { type FormEvent, useEffect, useState } from 'react';

export type ItemDesignerResult = {
    name: string;
    description?: string;
    category?: string;
    quantity?: number;
    priceBody?: number;
    priceMind?: number;
    priceSoul?: number;
};

type ItemDesignerProps = {
    isOpen: boolean;
    heading: string;
    includePricing?: boolean;
    includeQuantity?: boolean;
    submitLabel?: string;
    onClose: () => void;
    onSubmit: (values: ItemDesignerResult) => Promise<void> | void;
};

const ItemDesigner = ({
    isOpen,
    heading,
    includePricing = false,
    includeQuantity = false,
    submitLabel = 'Save',
    onClose,
    onSubmit,
}: ItemDesignerProps) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('General');
    const [quantity, setQuantity] = useState('1');
    const [priceBody, setPriceBody] = useState('0');
    const [priceMind, setPriceMind] = useState('0');
    const [priceSoul, setPriceSoul] = useState('0');
    const [formError, setFormError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const resetForm = () => {
        setName('');
        setDescription('');
        setCategory('General');
        setQuantity(includeQuantity ? '1' : '');
        setPriceBody('0');
        setPriceMind('0');
        setPriceSoul('0');
        setFormError(null);
        setSubmitting(false);
    };

    useEffect(() => {
        if (isOpen) {
            resetForm();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, includePricing, includeQuantity]);

    if (!isOpen) {
        return null;
    }

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        const trimmedName = name.trim();
        if (!trimmedName) {
            setFormError('Item name is required');
            return;
        }

        let parsedQuantity: number | undefined;
        if (includeQuantity) {
            const quantityValue = Number(quantity);
            if (
                !Number.isFinite(quantityValue) ||
                !Number.isInteger(quantityValue) ||
                quantityValue < 1
            ) {
                setFormError('Quantity must be a positive integer');
                return;
            }
            parsedQuantity = quantityValue;
        }

        let parsedPriceBody = 0;
        let parsedPriceMind = 0;
        let parsedPriceSoul = 0;
        if (includePricing) {
            const priceBodyValue = Number(priceBody);
            if (
                !Number.isFinite(priceBodyValue) ||
                !Number.isInteger(priceBodyValue) ||
                priceBodyValue < 0
            ) {
                setFormError('Body price must be a non-negative integer');
                return;
            }
            parsedPriceBody = priceBodyValue;

            const priceMindValue = Number(priceMind);
            if (
                !Number.isFinite(priceMindValue) ||
                !Number.isInteger(priceMindValue) ||
                priceMindValue < 0
            ) {
                setFormError('Mind price must be a non-negative integer');
                return;
            }
            parsedPriceMind = priceMindValue;

            const priceSoulValue = Number(priceSoul);
            if (
                !Number.isFinite(priceSoulValue) ||
                !Number.isInteger(priceSoulValue) ||
                priceSoulValue < 0
            ) {
                setFormError('Soul price must be a non-negative integer');
                return;
            }
            parsedPriceSoul = priceSoulValue;
        }

        const payload: ItemDesignerResult = {
            name: trimmedName,
        };
        const trimmedDescription =
            description.trim().length > 0 ? description.trim() : undefined;
        if (trimmedDescription) {
            payload.description = trimmedDescription;
        }
        const trimmedCategory = category.trim();
        if (trimmedCategory.length > 0) {
            payload.category = trimmedCategory;
        }
        if (parsedQuantity !== undefined) {
            payload.quantity = parsedQuantity;
        }
        if (includePricing) {
            payload.priceBody = parsedPriceBody;
            payload.priceMind = parsedPriceMind;
            payload.priceSoul = parsedPriceSoul;
        }

        try {
            setSubmitting(true);
            setFormError(null);
            await onSubmit(payload);
            resetForm();
            onClose();
        } catch (err) {
            setFormError((err as Error).message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        resetForm();
        onClose();
    };

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="item-designer-heading"
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
                <h2 id="item-designer-heading" style={{ marginTop: 0 }}>{heading}</h2>
                {formError ? <p style={{ color: 'red' }}>{formError}</p> : null}
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                    Name
                    <input
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        style={{ display: 'block', width: '100%', marginTop: '0.25rem' }}
                        disabled={submitting}
                    />
                </label>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                    Description (optional)
                    <textarea
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        style={{ display: 'block', width: '100%', marginTop: '0.25rem' }}
                        disabled={submitting}
                        rows={4}
                    />
                </label>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                    Category (optional)
                    <input
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                        style={{ display: 'block', width: '100%', marginTop: '0.25rem' }}
                        disabled={submitting}
                        placeholder="General"
                    />
                </label>
                {includeQuantity ? (
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                        Quantity
                        <input
                            value={quantity}
                            onChange={(event) => setQuantity(event.target.value)}
                            style={{ display: 'block', width: '100%', marginTop: '0.25rem' }}
                            disabled={submitting}
                            type="number"
                            min="1"
                        />
                    </label>
                ) : null}
                {includePricing ? (
                    <fieldset style={{ border: '1px solid #556', padding: '0.75rem', marginBottom: '1rem' }}>
                        <legend>Prices</legend>
                        <p style={{ marginTop: 0, fontSize: '0.85rem', color: '#ccd' }}>
                            Assign non-negative whole numbers for each category.
                        </p>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                            Body price
                            <input
                                type="number"
                                min="0"
                                step="1"
                                value={priceBody}
                                onChange={(event) => setPriceBody(event.target.value)}
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
                                onChange={(event) => setPriceMind(event.target.value)}
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
                                onChange={(event) => setPriceSoul(event.target.value)}
                                style={{ display: 'block', width: '100%', marginTop: '0.25rem' }}
                                disabled={submitting}
                            />
                        </label>
                    </fieldset>
                ) : null}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button type="button" onClick={handleCancel} disabled={submitting}>Cancel</button>
                    <button type="submit" disabled={submitting}>
                        {submitting ? 'Saving…' : submitLabel}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ItemDesigner;
