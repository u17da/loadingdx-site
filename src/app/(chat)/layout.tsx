// ★ 'use client' を外す ―― これで Server Component として async OK
import { auth } from '../(auth)/auth';
import ChatSidebar from '../../components/chat-sidebar';  // 相対パスに修正
import { redirect } from 'next/navigation';

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect('/sign-in');

  return (
    <div className="flex h-full">
      <ChatSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
