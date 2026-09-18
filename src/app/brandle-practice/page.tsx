import { hubMetadata, HubPage } from '@/lib/hubPage';

export const metadata = hubMetadata('brandle');

export default function Page() {
  return <HubPage id="brandle" />;
}
