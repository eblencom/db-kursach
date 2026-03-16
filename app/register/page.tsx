'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { Rss, UserPlus, AlertCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Ошибка регистрации');
        setLoading(false);
        return;
      }
      router.push('/login?registered=1');
      router.refresh();
    } catch {
      setError('Ошибка соединения');
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg">
            <Rss className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">Создайте аккаунт</h1>
            <p className="mt-1 text-sm text-muted-foreground">Регистрация в системе анализа новостей</p>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="pb-4 pt-6 px-6">
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>Новые пользователи получают роль <strong>аналитик</strong></span>
            </div>
            {error && (
              <Alert variant="destructive" className="mt-3">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4" id="register-form">
              <div className="space-y-1.5">
                <Label htmlFor="fullName">ФИО</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Иванов Иван"
                  className="h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="user@example.com"
                  className="h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Минимум 6 символов"
                  className="h-11"
                />
              </div>
            </form>
            <Button type="submit" form="register-form" disabled={loading} className="h-11 w-full text-sm font-semibold">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Регистрация...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Зарегистрироваться
                </span>
              )}
            </Button>
          </CardContent>
          <Separator />
          <CardFooter className="flex-col gap-3 px-6 py-5">
            <p className="text-center text-sm text-muted-foreground">
              Уже есть аккаунт?{' '}
              <Link href="/login" className="font-semibold text-foreground hover:underline">
                Войти
              </Link>
            </p>
            <Link href="/" className="text-xs text-muted-foreground hover:text-foreground hover:underline">
              ← На главную
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
