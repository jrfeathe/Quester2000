import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import type { PointsBalance } from '../api/user';
import { getPoints } from '../api/user';

type UserPointsSummaryProps = {
  refreshKey?: number | string;
  className?: string;
  style?: CSSProperties;
};

const UserPointsSummary = ({ refreshKey, className, style }: UserPointsSummaryProps) => {
  const [points, setPoints] = useState<PointsBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setPoints(null);

    getPoints()
      .then((data) => {
        if (cancelled) return;
        setPoints(data);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  let content = 'Loading points…';
  if (!loading && error) {
    content = `Failed to load points: ${error}`;
  } else if (!loading && points) {
    content = `Body ${points.pointsBody} · Mind ${points.pointsMind} · Soul ${points.pointsSoul}`;
  } else if (!loading) {
    content = 'No points data available.';
  }

  return (
    <p className={className} style={style}>
      {content}
    </p>
  );
};

export default UserPointsSummary;
