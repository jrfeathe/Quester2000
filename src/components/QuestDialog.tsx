import InventoryListItem from './InventoryListItem';
import type { Item } from '../api/items';
import type { FormEvent } from 'react';

type QuestDialogProps = {
    isOpen: boolean;
    formError: string | null;
    title: string;
    details: string;
    group: string;
    rewardBody: string;
    rewardMind: string;
    rewardSoul: string;
    items: Item[];
    itemsLoading: boolean;
    itemsError: string | null;
    selectedRewardItemIds: number[];
    submitting: boolean;
    onClose: () => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onTitleChange: (value: string) => void;
    onDetailsChange: (value: string) => void;
    onGroupChange: (value: string) => void;
    onRewardBodyChange: (value: string) => void;
    onRewardMindChange: (value: string) => void;
    onRewardSoulChange: (value: string) => void;
    onToggleRewardItem: (itemId: number) => void;
    onClearSelectedItems: () => void;
};

const QuestDialog = ({
    isOpen,
    formError,
    title,
    details,
    group,
    rewardBody,
    rewardMind,
    rewardSoul,
    items,
    itemsLoading,
    itemsError,
    selectedRewardItemIds,
    submitting,
    onClose,
    onSubmit,
    onTitleChange,
    onDetailsChange,
    onGroupChange,
    onRewardBodyChange,
    onRewardMindChange,
    onRewardSoulChange,
    onToggleRewardItem,
    onClearSelectedItems,
}: QuestDialogProps) => {
    if (!isOpen) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-quest-heading"
            className="skyui-modal"
        >
            <form onSubmit={onSubmit} className="skyui-pane skyui-dialog">
                <h2 id="add-quest-heading" className="skyui-title">
                    Add Quest
                </h2>
                {formError ? <p className="skyui-error">{formError}</p> : null}

                <div className="field">
                    <label htmlFor="quest-title">Title</label>
                    <input
                        id="quest-title"
                        className="skyui-input"
                        value={title}
                        onChange={(event) => onTitleChange(event.target.value)}
                        disabled={submitting}
                    />
                </div>

                <div className="field">
                    <label htmlFor="quest-details">Details (optional)</label>
                    <textarea
                        id="quest-details"
                        className="skyui-textarea"
                        value={details}
                        onChange={(event) => onDetailsChange(event.target.value)}
                        disabled={submitting}
                        rows={4}
                    />
                </div>

                <div className="field">
                    <label htmlFor="quest-group">Group (optional)</label>
                    <input
                        id="quest-group"
                        className="skyui-input"
                        value={group}
                        onChange={(event) => onGroupChange(event.target.value)}
                        disabled={submitting}
                        placeholder="General"
                    />
                </div>

                <fieldset className="skyui-fieldset">
                    <legend className="skyui-legend">Point rewards</legend>
                    <p className="skyui-muted skyui-small" style={{ marginTop: 0 }}>
                        Assign non-negative whole numbers for each category.
                    </p>
                    <div className="field">
                        <label htmlFor="reward-body">Body</label>
                        <input
                            id="reward-body"
                            type="number"
                            min="0"
                            step="1"
                            className="skyui-input"
                            value={rewardBody}
                            onChange={(event) => onRewardBodyChange(event.target.value)}
                            disabled={submitting}
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="reward-mind">Mind</label>
                        <input
                            id="reward-mind"
                            type="number"
                            min="0"
                            step="1"
                            className="skyui-input"
                            value={rewardMind}
                            onChange={(event) => onRewardMindChange(event.target.value)}
                            disabled={submitting}
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="reward-soul">Soul</label>
                        <input
                            id="reward-soul"
                            type="number"
                            min="0"
                            step="1"
                            className="skyui-input"
                            value={rewardSoul}
                            onChange={(event) => onRewardSoulChange(event.target.value)}
                            disabled={submitting}
                        />
                    </div>
                </fieldset>

                <fieldset className="skyui-fieldset">
                    <legend className="skyui-legend">Item rewards</legend>
                    <div
                        className="skyui-flex"
                        style={{ alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}
                    >
                        <p className="skyui-muted skyui-small" style={{ margin: 0, flex: 1 }}>
                            Select one or more items to grant when the quest is completed.
                        </p>
                        {selectedRewardItemIds.length > 0 ? (
                            <button
                                type="button"
                                className="skyui-btn ghost skyui-small"
                                onClick={onClearSelectedItems}
                                disabled={submitting}
                            >
                                Clear selection
                            </button>
                        ) : null}
                    </div>
                    {itemsLoading ? (
                        <p className="skyui-muted">Loading items…</p>
                    ) : itemsError ? (
                        <p className="skyui-error">Failed to load items: {itemsError}</p>
                    ) : items.length === 0 ? (
                        <p className="skyui-muted">No items available yet.</p>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '12px' }}>
                            {items.map((item) => {
                                const checked = selectedRewardItemIds.includes(item.id);
                                return (
                                    <li key={item.id}>
                                        <label
                                            style={{
                                                display: 'flex',
                                                gap: '8px',
                                                alignItems: 'flex-start',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                name="rewardItem"
                                                value={item.id}
                                                checked={checked}
                                                onChange={() => onToggleRewardItem(item.id)}
                                                disabled={submitting}
                                            />
                                            <div style={{ flex: 1 }}>
                                                <InventoryListItem item={item} />
                                            </div>
                                        </label>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </fieldset>

                <div className="skyui-buttons" style={{ justifyContent: 'flex-end' }}>
                    <button
                        type="button"
                        className="skyui-btn"
                        onClick={onClose}
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                    <button type="submit" className="skyui-btn primary" disabled={submitting}>
                        {submitting ? 'Saving…' : 'Save'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default QuestDialog;
