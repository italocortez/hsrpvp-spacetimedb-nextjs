export default async function DraftPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
  return <div>Draft - Match {matchId}</div>;
}
