import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import QuestDialog from '../components/QuestDialog';
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
    const [selectedQuestId, setSelectedQuestId] = useState<number | null>(null);
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
        setSelectedQuestId((prev) => {
            if (quests.length === 0) return null;
            if (prev && quests.some((quest) => quest.id === prev)) return prev;
            return quests[0].id;
        });
    }, [quests]);

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
            setSelectedQuestId(quest.id);
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
            setQuests((prev) => {
                const next = prev.filter((quest) => quest.id !== questId);
                setSelectedQuestId((current) => {
                    if (current !== questId) return current;
                    return next.length > 0 ? next[0].id : null;
                });
                return next;
            });
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

    const selectedQuest = useMemo(
        () => quests.find((quest) => quest.id === selectedQuestId) ?? null,
        [quests, selectedQuestId]
    );

    if (loading) return <div>Loading quests…</div>;
    if (error) return <div>Failed to load quests: {error}</div>;

    return (
        <>
            <div className="skyui-columns">
                <QuestMenu
                    quests={quests}
                    selectedQuestId={selectedQuestId}
                    onSelectQuest={(questId) => setSelectedQuestId(questId)}
                    onOpenDialog={openDialog}
                />

                <section className="skyui-pane skyui-detail">
                    <div className="skyui-flex" style={{ alignItems: 'flex-start' }}>
                        <div>
                            <h2 className="skyui-title">
                                {selectedQuest ? selectedQuest.title : 'Select a quest'}
                            </h2>
                            <p className="skyui-muted skyui-small">
                                {selectedQuest
                                    ? `${(selectedQuest.group && selectedQuest.group.trim()) || 'General'} • ${
                                          selectedQuest.completed ? 'Completed' : 'In Progress'
                                      }`
                                    : 'Choose a quest from the list to see its details.'}
                            </p>
                        </div>
                        <UserPointsSummary
                            refreshKey={pointsRefreshKey}
                            className="skyui-muted skyui-small"
                            style={{ margin: 0, textAlign: 'right' }}
                        />
                    </div>
                    <div className="skyui-rule" />

                    {selectedQuest ? (
                        <>
                            {selectedQuest.details ? (
                                <p className="blurb">{selectedQuest.details}</p>
                            ) : (
                                <p className="skyui-muted">
                                    No additional details provided for this quest.
                                </p>
                            )}

                            {(() => {
                                if (
                                    selectedQuest.rewardBody === 0 &&
                                    selectedQuest.rewardMind === 0 &&
                                    selectedQuest.rewardSoul === 0 &&
                                    !(selectedQuest.rewardItems && selectedQuest.rewardItems.length > 0)
                                ) {
                                    return <></>;
                                }
                                else {
                                    return <h3 className="skyui-subtitle">Rewards</h3>
                                }
                            })()}

                            {(() => {
                                const entries = [
                                    selectedQuest.rewardBody > 0 ? `Body ${selectedQuest.rewardBody}` : null,
                                    selectedQuest.rewardMind > 0 ? `Mind ${selectedQuest.rewardMind}` : null,
                                    selectedQuest.rewardSoul > 0 ? `Soul ${selectedQuest.rewardSoul}` : null,
                                ].filter(Boolean);
                                if (entries.length === 0) {
                                    return <></>;
                                }
                                return <ul className="diamond-list"><li>{entries.join(' · ')}</li></ul>;
                            })()}

                            {selectedQuest.rewardItems && selectedQuest.rewardItems.length > 0 ? (
                                <ul className="diamond-list">
                                    {selectedQuest.rewardItems.map((item) => (
                                        <li key={item.id}>{item.title}</li>
                                    ))}
                                </ul>
                            ) : (
                                <></>
                            )}

                            <div
                                className="skyui-buttons"
                                style={{ justifyContent: 'flex-end', marginTop: '16px', flexWrap: 'wrap' }}
                            >
                                <button
                                    type="button"
                                    className="skyui-btn"
                                    onClick={() =>
                                        handleToggleComplete(selectedQuest.id, !selectedQuest.completed)
                                    }
                                >
                                    {selectedQuest.completed ? 'Mark as incomplete' : 'Mark as complete'}
                                </button>
                                <button
                                    type="button"
                                    className="skyui-btn ghost"
                                    onClick={() => handleDelete(selectedQuest.id)}
                                >
                                    Delete quest
                                </button>
                            </div>
                        </>
                    ) : (
                        <p className="skyui-muted">
                            There are no quests to display.
                        </p>
                    )}
                </section>
            </div>
            <QuestDialog
                isOpen={isDialogOpen}
                formError={formError}
                title={title}
                details={details}
                group={group}
                rewardBody={rewardBody}
                rewardMind={rewardMind}
                rewardSoul={rewardSoul}
                items={items}
                itemsLoading={itemsLoading}
                itemsError={itemsError}
                selectedRewardItemIds={selectedRewardItemIds}
                submitting={submitting}
                onClose={closeDialog}
                onSubmit={handleSubmit}
                onTitleChange={setTitle}
                onDetailsChange={setDetails}
                onGroupChange={setGroup}
                onRewardBodyChange={setRewardBody}
                onRewardMindChange={setRewardMind}
                onRewardSoulChange={setRewardSoul}
                onToggleRewardItem={toggleRewardItemSelection}
                onClearSelectedItems={() => setSelectedRewardItemIds([])}
            />
        </>
    );
};

export default Quests;
