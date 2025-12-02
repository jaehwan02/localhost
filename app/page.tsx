import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect root page to community
  redirect('/community');
}
