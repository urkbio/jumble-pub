import Username from '../Username'

export function EmbeddedMention({ userId }: { userId: string }) {
  return <Username userId={userId} showAt className="text-highlight font-normal inline-block" />
}
