import { useEffect, useState } from 'react';
import QuestMenu from '../components/QuestMenu';
import type { Quest } from '../api/quests';
import { list as fetchQuests } from '../api/quests';

const Quests = () => {
    const [quests, setQuests] = useState<Quest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchQuests()
            .then(setQuests)
            .catch((err: Error) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div>Loading quests…</div>;
    if (error) return <div>Failed to load quests: {error}</div>;

    return <QuestMenu quests={quests} />;
};

export default Quests;
