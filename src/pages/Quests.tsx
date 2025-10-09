import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import QuestMenu from '../components/QuestMenu';
import type { Quest } from '../api/quests';
import {
    create as createQuest,
    list as fetchQuests,
    remove as deleteQuest,
    updateCompletion as toggleQuestCompletion,
} from '../api/quests';

const Quests = () => {
    const [quests, setQuests] = useState<Quest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [details, setDetails] = useState('');
    const [group, setGroup] = useState('General');
    const [formError, setFormError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchQuests()
            .then(setQuests)
            .catch((err: Error) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const resetDialog = () => {
        setTitle('');
        setDetails('');
        setGroup('General');
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
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!title.trim()) {
            setFormError('Quest title is required');
            return;
        }
        setSubmitting(true);
        try {
            const quest = await createQuest({
                title: title.trim(),
                details: details.trim() ? details.trim() : undefined,
                group: group.trim() ? group.trim() : undefined,
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
        } catch (err) {
            alert((err as Error).message);
        }
    };

    if (loading) return <div>Loading quests…</div>;
    if (error) return <div>Failed to load quests: {error}</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Quests</h1>
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
                        style={{ background: '#223', padding: '1.5rem', borderRadius: '0.5rem', minWidth: '280px' }}
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
