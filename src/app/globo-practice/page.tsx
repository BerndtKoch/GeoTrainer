import { hubMetadata, HubPage } from '@/lib/hubPage';

export const metadata = hubMetadata('globo');

export default function Page() {
  return <HubPage id="globo" />;
}
