import { hubMetadata, HubPage } from '@/lib/hubPage';

export const metadata = hubMetadata('globle');

export default function Page() {
  return <HubPage id="globle" />;
}
