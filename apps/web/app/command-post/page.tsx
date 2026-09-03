import { CommandPostGate } from './CommandPostGate';
import { CommandPostHome } from './CommandPostHome';

export default function CommandPostPage() {
  return <CommandPostGate><CommandPostHome /></CommandPostGate>;
}
