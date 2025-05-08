'use client';

import Link from 'next/link';

export default function ChatSidebar() {
  return (
    <aside className="w-64 border-r p-4 space-y-2">
      <Link href="/" className="block font-bold">
        New chat
      </Link>
      {/* ここに履歴一覧などを後で追加 */}
    </aside>
  );
}
