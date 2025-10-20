import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import InventoryListItem from '../components/InventoryListItem';
import QuestMenu from '../components/QuestMenu';
import UserPointsSummary from '../components/UserPointsSummary';
import type { Quest } from '../api/quests';
import {
    create as createQuest,
    list as fetchQuests,
    remove as deleteQuest,
    updateCompletion as toggleQuestCompletion,
} from '../api/quests';
import type { Item } from '../api/items';
import { list as fetchItems } from '../api/items';

const Quests = () => {
    const [quests, setQuests] = useState<Quest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [details, setDetails] = useState('');
    const [group, setGroup] = useState('General');
    const [rewardBody, setRewardBody] = useState('0');
    const [rewardMind, setRewardMind] = useState('0');
    const [rewardSoul, setRewardSoul] = useState('0');
    const [items, setItems] = useState<Item[]>([]);
    const [itemsLoading, setItemsLoading] = useState(true);
    const [itemsError, setItemsError] = useState<string | null>(null);
    const [selectedRewardItemIds, setSelectedRewardItemIds] = useState<number[]>([]);
    const [formError, setFormError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [pointsRefreshKey, setPointsRefreshKey] = useState(0);
    const loadItems = useCallback(async () => {
        setItemsLoading(true);
        setItemsError(null);
        try {
            const fetchedItems = await fetchItems();
            setItems(fetchedItems);
            setSelectedRewardItemIds((prev) => {
                if (prev.length === 0) return prev;
                const allowed = new Set(fetchedItems.map((item) => item.id));
                return prev.filter((id) => allowed.has(id));
            });
            return fetchedItems;
        } catch (err) {
            setItems([]);
            setItemsError((err as Error).message);
            throw err;
        } finally {
            setItemsLoading(false);
        }
    }, []);

    const toggleRewardItemSelection = useCallback((itemId: number) => {
        setSelectedRewardItemIds((prev) =>
            prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
        );
    }, []);

    useEffect(() => {
        fetchQuests()
            .then(setQuests)
            .catch((err: Error) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        loadItems().catch(() => undefined);
    }, [loadItems]);

    const resetDialog = () => {
        setTitle('');
        setDetails('');
        setGroup('General');
        setRewardBody('0');
        setRewardMind('0');
        setRewardSoul('0');
        setSelectedRewardItemIds([]);
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
        loadItems().catch(() => undefined);
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!title.trim()) {
            setFormError('Quest title is required');
            return;
        }

        const parseReward = (value: string, label: string) => {
            const trimmed = value.trim();
            if (!trimmed) return 0;
            const numeric = Number(trimmed);
            if (!Number.isFinite(numeric) || !Number.isInteger(numeric) || numeric < 0) {
                throw new Error(`${label} must be a non-negative integer`);
            }
            return numeric;
        };

        let parsedRewardBody = 0;
        let parsedRewardMind = 0;
        let parsedRewardSoul = 0;

        try {
            parsedRewardBody = parseReward(rewardBody, 'Body reward');
            parsedRewardMind = parseReward(rewardMind, 'Mind reward');
            parsedRewardSoul = parseReward(rewardSoul, 'Soul reward');
        } catch (parseError) {
            setFormError((parseError as Error).message);
            return;
        }

        setSubmitting(true);
        try {
            const quest = await createQuest({
                title: title.trim(),
                details: details.trim() ? details.trim() : undefined,
                group: group.trim() ? group.trim() : undefined,
                ...(selectedRewardItemIds.length > 0 ? { rewardItemIds: selectedRewardItemIds } : {}),
                rewardBody: parsedRewardBody,
                rewardMind: parsedRewardMind,
                rewardSoul: parsedRewardSoul,
            });
            setQuests((prev) => [quest, ...prev]);
            closeDialog();
        } catch (err) {
            setFormError((err as Error).message);
            setSubmitting(false);
        }
    };

    const handleDelete = async (questId: number) => {
        const confirmed = window.confirm('Delete this quest?');
        if (!confirmed) return;

        try {
            await deleteQuest(questId);
            setQuests((prev) => prev.filter((quest) => quest.id !== questId));
        } catch (err) {
            alert((err as Error).message);
        }
    };

    const handleToggleComplete = async (questId: number, nextCompleted: boolean) => {
        try {
            const updated = await toggleQuestCompletion(questId, nextCompleted);
            setQuests((prev) =>
                prev.map((quest) => (quest.id === updated.id ? updated : quest))
            );
            if (updated.rewardBody > 0 || updated.rewardMind > 0 || updated.rewardSoul > 0) {
                setPointsRefreshKey((prev) => prev + 1);
            }
            if (updated.rewardItems && updated.rewardItems.length > 0) {
                loadItems().catch(() => undefined);
            }
        } catch (err) {
            alert((err as Error).message);
        }
    };

    if (loading) return <div>Loading quests…</div>;
    if (error) return <div>Failed to load quests: {error}</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ marginBottom: '0.25rem' }}>Quests</h1>
                    <UserPointsSummary
                        refreshKey={pointsRefreshKey}
                        style={{ margin: 0, fontSize: '0.9rem', color: '#ccc' }}
                    />
                </div>
                <button type="button" onClick={openDialog}>Add Quest</button>
            </div>
            <QuestMenu quests={quests} onDelete={handleDelete} onToggleComplete={handleToggleComplete} />
            {isDialogOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="add-quest-heading"
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
                        style={{
                            background: '#223',
                            padding: '1.5rem',
                            borderRadius: '0.5rem',
                            minWidth: '280px',
                            maxHeight: '85vh',
                            overflowY: 'auto',
                        }}
                    >
                        <h2 id="add-quest-heading" style={{ marginTop: 0 }}>Add Quest</h2>
                        {formError ? <p style={{ color: 'red' }}>{formError}</p> : null}
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                            Title
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                style={{ display: 'block', width: '100%', marginTop: '0.25rem' }}
                                disabled={submitting}
                            />
                        </label>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                            Details (optional)
                            <textarea
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                style={{ display: 'block', width: '100%', marginTop: '0.25rem' }}
                                disabled={submitting}
                                rows={4}
                            />
                        </label>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                            Group (optional)
                            <input
                                value={group}
                                onChange={(e) => setGroup(e.target.value)}
                                style={{ display: 'block', width: '100%', marginTop: '0.25rem' }}
                                disabled={submitting}
                                placeholder="General"
                            />
                        </label>
                        <fieldset style={{ border: '1px solid #556', padding: '0.75rem', marginBottom: '1rem' }}>
                            <legend>Point rewards</legend>
                            <p style={{ marginTop: 0, fontSize: '0.85rem', color: '#ccd' }}>
                                Assign non-negative whole numbers for each category.
                            </p>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                                Body
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={rewardBody}
                                    onChange={(e) => setRewardBody(e.target.value)}
                                    style={{ display: 'block', width: '100%', marginTop: '0.25rem' }}
                                    disabled={submitting}
                                />
                            </label>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                                Mind
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={rewardMind}
                                    onChange={(e) => setRewardMind(e.target.value)}
                                    style={{ display: 'block', width: '100%', marginTop: '0.25rem' }}
                                    disabled={submitting}
                                />
                            </label>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                                Soul
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={rewardSoul}
                                    onChange={(e) => setRewardSoul(e.target.value)}
                                    style={{ display: 'block', width: '100%', marginTop: '0.25rem' }}
                                    disabled={submitting}
                                />
                            </label>
                        </fieldset>
                        <fieldset style={{ border: '1px solid #556', padding: '0.75rem', marginBottom: '1rem' }}>
                            <legend>Item rewards</legend>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#ccd' }}>
                                    Select one or more items to grant when the quest is completed.
                                </p>
                                {selectedRewardItemIds.length > 0 ? (
                                    <button
                                        type="button"
                                        onClick={() => setSelectedRewardItemIds([])}
                                        disabled={submitting}
                                    >
                                        Clear selection
                                    </button>
                                ) : null}
                            </div>
                            {itemsLoading ? (
                                <p style={{ margin: 0 }}>Loading items…</p>
                            ) : itemsError ? (
                                <p style={{ margin: 0, color: 'salmon' }}>Failed to load items: {itemsError}</p>
                            ) : items.length === 0 ? (
                                <p style={{ margin: 0 }}>No items available yet.</p>
                            ) : (
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {items.map((item) => {
                                        const checked = selectedRewardItemIds.includes(item.id);
                                        return (
                                            <li key={item.id}>
                                                <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', cursor: 'pointer' }}>
                                                    <input
                                                        type="checkbox"
                                                        name="rewardItem"
                                                        value={item.id}
                                                        checked={checked}
                                                        onChange={() => toggleRewardItemSelection(item.id)}
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

export default Quests;
