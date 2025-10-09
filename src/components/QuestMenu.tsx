import QuestListItem from './QuestListItem';
import type { Quest } from '../api/quests';

type QuestMenuProps = {
    quests: Quest[];
    onDelete?: (id: number) => void;
    onToggleComplete?: (id: number, nextCompleted: boolean) => void;
};

const QuestMenu = ({ quests, onDelete, onToggleComplete }: QuestMenuProps) => (
    <main>
        {quests.length === 0 ? (
            <p>No quests found yet.</p>
        ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {quests.map((quest) => (
                    <li key={quest.id} style={{ margin: '1rem 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center' }}>
                            <QuestListItem quest={quest} />
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                                <button
                                    type="button"
                                    onClick={() => onToggleComplete?.(quest.id, !quest.completed)}
                                >
                                    {quest.completed ? 'Mark as incomplete' : 'Mark as complete'}
                                </button>
                                {onDelete ? (
                                    <button type="button" onClick={() => onDelete(quest.id)}>
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

export default QuestMenu;
