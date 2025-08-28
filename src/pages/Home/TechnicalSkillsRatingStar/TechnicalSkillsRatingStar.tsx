import type { FC, ReactNode } from 'react';

import type { TechnicalSkillsRatingStarProps } from '@/types/components';

import { memo, useMemo } from 'react';

import { faStar as faRegularStar } from '@fortawesome/free-regular-svg-icons';
import { faStar, faStarHalfStroke } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const TechnicalSkillsRatingStar: FC<TechnicalSkillsRatingStarProps> = ({ numberRate }) => {
  const clamped = useMemo(() => Math.max(0, Math.min(5, Number(numberRate) || 0)), [numberRate]);

  const { fullCount, hasHalf, emptyCount } = useMemo(() => {
    const full = Math.floor(clamped);
    const half = clamped - full >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return { fullCount: full, hasHalf: half, emptyCount: empty };
  }, [clamped]);

  const stars = useMemo((): ReactNode => {
    const nodes: ReactNode[] = [];

    for (let i = 0; i < fullCount; i++) {
      nodes.push(<FontAwesomeIcon key={`full-${i}`} icon={faStar} aria-hidden="true" />);
    }

    if (hasHalf) {
      nodes.push(<FontAwesomeIcon key="half" icon={faStarHalfStroke} aria-hidden="true" />);
    }

    for (let i = 0; i < emptyCount; i++) {
      nodes.push(<FontAwesomeIcon key={`empty-${i}`} icon={faRegularStar} aria-hidden="true" />);
    }

    return nodes;
  }, [fullCount, hasHalf, emptyCount]);

  return <>{stars}</>;
};

export default memo(TechnicalSkillsRatingStar);
