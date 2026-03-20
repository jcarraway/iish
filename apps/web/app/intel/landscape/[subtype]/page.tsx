'use client';

import { useParams } from 'next/navigation';
import { IntelSubtypeLandscapeScreen } from '@oncovax/app';

export default function IntelSubtypeLandscapePage() {
  const params = useParams();
  const subtype = params.subtype as string;
  return <IntelSubtypeLandscapeScreen subtype={subtype} />;
}
