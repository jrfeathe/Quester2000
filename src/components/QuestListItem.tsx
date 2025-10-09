import type { Quest } from '../api/quests';

type QuestListItemProps = {
    quest: Quest;
};

const QuestListItem = ({ quest }: QuestListItemProps) => (
    <div className="quest-list-item">
        <h2>{quest.title}</h2>
        {quest.details ? <p>{quest.details}</p> : <p>No additional details provided.</p>}
        <p>
            Complete:{' '}
            <span>
                {quest.completed ? '✅' : '❌'}
            </span>
        </p>
    </div>
);

export default QuestListItem;
