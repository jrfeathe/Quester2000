import type { Quest } from '../api/quests';

type QuestListItemProps = {
    quest: Quest;
};

const QuestListItem = ({ quest }: QuestListItemProps) => (
    <div className="quest-list-item">
        <h2>{quest.title}</h2>
        <p>Group: {quest.group}</p>
        {quest.details ? <p>{quest.details}</p> : <p>No additional details provided.</p>}
        {quest.rewardBody > 0 || quest.rewardMind > 0 || quest.rewardSoul > 0 ? (
            <p>
                Rewards: Body {quest.rewardBody} · Mind {quest.rewardMind} · Soul {quest.rewardSoul}
            </p>
        ) : (
            <p>No point rewards assigned.</p>
        )}
        <p>
            Complete:{' '}
            <span>
                {quest.completed ? '✅' : '❌'}
            </span>
        </p>
    </div>
);

export default QuestListItem;
