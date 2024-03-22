import { auth } from '@/auth.config';
import { redirect } from 'next/navigation';

interface Props {
  children: React.ReactNode;
}
export default async function AdminLayout({ children }: Props) {
  const session = await auth();

  if (session?.user.role !== 'admin') redirect('/login');

  return <>{children}</>;
}
