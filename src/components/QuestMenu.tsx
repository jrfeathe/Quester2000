import QuestListItem from './QuestListItem';
import type { Quest } from '../api/quests';

type QuestMenuProps = {
    quests: Quest[];
    selectedQuestId: number | null;
    onSelectQuest: (questId: number) => void;
    onOpenDialog: () => void;
};

const QuestMenu = ({ quests, selectedQuestId, onSelectQuest, onOpenDialog }: QuestMenuProps) => (
    <aside className="skyui-pane">
        <div className="skyui-flex" style={{ alignItems: 'flex-start' }}>
            <button type="button" className="skyui-btn primary" onClick={onOpenDialog}>
                Add Quest
            </button>
        </div>
        <div className="skyui-rule" />
        {quests.length === 0 ? (
            <p className="skyui-muted">
                No quests available.
            </p>
        ) : (
            <ul className="skyui-quests">
                {quests.map((quest) => (
                    <QuestListItem
                        key={quest.id}
                        quest={quest}
                        isActive={quest.id === selectedQuestId}
                        onSelect={onSelectQuest}
                    />
                ))}
            </ul>
        )}
    </aside>
);

export default QuestMenu;
