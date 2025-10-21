import type { KeyboardEvent } from 'react';
import type { Quest } from '../api/quests';

type QuestListItemProps = {
    quest: Quest;
    isActive: boolean;
    onSelect: (questId: number) => void;
};

const QuestListItem = ({ quest, isActive, onSelect }: QuestListItemProps) => {
    const questClasses = ['skyui-quest'];
    if (isActive) questClasses.push('is-active');

    const handleClick = () => {
        onSelect(quest.id);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLLIElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSelect(quest.id);
        }
    };

    return (
        <li
            className={questClasses.join(' ')}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="button"
            aria-pressed={isActive}
        >
            <div className="title">{quest.title}</div>
            <div className="meta">
                {(quest.group && quest.group.trim()) || 'General'}
                {quest.completed ? ' • Completed' : ''}
            </div>
        </li>
    );
};

export default QuestListItem;
