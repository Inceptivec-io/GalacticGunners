import { CommandPostGate } from './CommandPostGate';

export default function CommandPostPage() {
  return <CommandPostGate><main className="admin-session-state"><h1>Command Post</h1><p>Select an authorised organisation to manage its maps and campaign setup.</p><nav aria-label="Command Post"><a href="/command-post/founder-demo">Founder Demo Organisation</a><a href="/account">Account</a></nav></main></CommandPostGate>;
}
