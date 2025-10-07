import QuestListItem from './QuestListItem';
import type { Quest } from '../api/quests';

type QuestMenuProps = {
    quests: Quest[];
};

const QuestMenu = ({ quests }: QuestMenuProps) => (
    <main>
        <h1>Quests</h1>
        {quests.length === 0 ? (
            <p>No quests found yet.</p>
        ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {quests.map((quest) => (
                    <li key={quest.id} style={{ margin: '1rem 0' }}>
                        <QuestListItem quest={quest} />
                    </li>
                ))}
            </ul>
        )}
    </main>
);

export default QuestMenu;
