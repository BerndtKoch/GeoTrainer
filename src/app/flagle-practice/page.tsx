import { hubMetadata, HubPage } from '@/lib/hubPage';

export const metadata = hubMetadata('flagle');

export default function Page() {
  return <HubPage id="flagle" />;
}
