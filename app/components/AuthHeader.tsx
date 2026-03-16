'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { LogIn, LogOut, UserPlus, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function AuthHeader() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="h-10 w-32 animate-pulse rounded-md bg-white/10" />;
  }

  if (session?.user) {
    const role = (session.user as { role?: string }).role;
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 backdrop-blur-sm">
          <User className="h-4 w-4 text-white/70" />
          <span className="text-sm font-medium text-white">{session.user.name}</span>
          {role && (
            <Badge
              variant={role === 'admin' ? 'warning' : 'success'}
              className="ml-1 text-[10px]"
            >
              {role}
            </Badge>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          <LogOut className="h-4 w-4" />
          Выйти
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
        asChild
      >
        <Link href="/login">
          <LogIn className="h-4 w-4" />
          Вход
        </Link>
      </Button>
      <Button size="sm" className="bg-white text-slate-900 hover:bg-white/90" asChild>
        <Link href="/register">
          <UserPlus className="h-4 w-4" />
          Регистрация
        </Link>
      </Button>
    </div>
  );
}
