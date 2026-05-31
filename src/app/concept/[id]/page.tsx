import { getAllConceptIds } from '@/data/concepts';
import ConceptPageClient from './ConceptPageClient';

export function generateStaticParams() {
  return getAllConceptIds().map(id => ({ id }));
}

export default function ConceptPage({ params }: { params: Promise<{ id: string }> }) {
  // In Next.js 15, params is a Promise
  return <ConceptPageClientWrapper params={params} />;
}

import { Suspense } from 'react';

async function ConceptPageClientWrapper({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ConceptPageClient id={id} />;
}
