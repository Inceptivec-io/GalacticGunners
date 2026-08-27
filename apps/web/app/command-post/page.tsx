import { CommandPostGate } from './CommandPostGate';

export default function CommandPostPage() {
  return <CommandPostGate><main className="admin-session-state"><h1>Command Post</h1><nav aria-label="Command Post"><a href="#overview">Overview</a><a href="#maps">My Maps</a><a href="#games">My Games</a><a href="#scores">Scores</a><a href="#profile">Profile</a></nav><p id="overview">Organisation-scoped campaign and map operations are available here.</p></main></CommandPostGate>;
}
