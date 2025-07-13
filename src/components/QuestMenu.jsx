import React from 'react';
import QuestListItem from '../components/QuestListItem';

const quests = [
    { id: 1, Component: QuestListItem },
    { id: 2, Component: QuestListItem },
    { id: 3, Component: QuestListItem },
];

const QuestMenu = () => (
    <main>
        <h1>Quests</h1>
        <ul style={{ listStyle: 'none', padding: 0 }}>
            {quests.map(({ id, Component }) => (
                <li key={id} style={{ margin: '1rem 0' }}>
                    <Component />
                </li>
            ))}
        </ul>
    </main>
);

export default QuestMenu;

