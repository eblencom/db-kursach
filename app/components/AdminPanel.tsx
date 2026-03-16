'use client';

import { useState } from 'react';
import {
  ShieldAlert, Trash2, RefreshCw, Users, Newspaper,
  ChevronDown, ChevronUp, AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type User = { id: number; email: string; full_name: string; role: string };
type AdminNewsItem = {
  id: number;
  title: string;
  source_name: string;
  published_at: string;
  sentiment: number | null;
};

type AdminPanelProps = {
  users: User[];
  news: AdminNewsItem[];
  currentUserId?: string;
  onUsersChange: (users: User[]) => void;
  onNewsChange: (news: AdminNewsItem[]) => void;
};

type ConfirmState = {
  open: boolean;
  type: 'deleteUser' | 'deleteNews' | null;
  targetId: number | null;
  targetLabel: string;
};

export function AdminPanel({
  users, news, currentUserId, onUsersChange, onNewsChange,
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'news'>('users');
  const [busy, setBusy] = useState<number | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState>({ open: false, type: null, targetId: null, targetLabel: '' });
  const [expanded, setExpanded] = useState(true);

  async function handleDeleteUser(userId: number) {
    setBusy(userId);
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      if (res.ok) onUsersChange(users.filter((u) => u.id !== userId));
    } catch (e) { console.error(e); }
    setBusy(null);
    setConfirm({ open: false, type: null, targetId: null, targetLabel: '' });
  }

  async function handleChangeRole(userId: number, newRole: string) {
    setBusy(userId);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        onUsersChange(users.map((u) => u.id === userId ? { ...u, role: newRole } : u));
      }
    } catch (e) { console.error(e); }
    setBusy(null);
  }

  async function handleDeleteNews(newsId: number) {
    setBusy(newsId);
    try {
      const res = await fetch(`/api/news/${newsId}`, { method: 'DELETE' });
      if (res.ok) onNewsChange((news as AdminNewsItem[]).filter((n) => n.id !== newsId));
    } catch (e) { console.error(e); }
    setBusy(null);
    setConfirm({ open: false, type: null, targetId: null, targetLabel: '' });
  }

  function askConfirm(type: ConfirmState['type'], targetId: number, targetLabel: string) {
    setConfirm({ open: true, type, targetId, targetLabel });
  }

  function handleConfirmed() {
    if (!confirm.targetId) return;
    if (confirm.type === 'deleteUser') handleDeleteUser(confirm.targetId);
    if (confirm.type === 'deleteNews') handleDeleteNews(confirm.targetId);
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' });

  const sentimentText = (s: number | null) => {
    if (s == null) return { label: 'Нейтрал', variant: 'secondary' as const };
    if (s > 0.5) return { label: 'Позитив', variant: 'success' as const };
    if (s < -0.3) return { label: 'Негатив', variant: 'destructive' as const };
    return { label: 'Нейтрал', variant: 'secondary' as const };
  };

  return (
    <>
      <Card className="border-amber-200 shadow-md">
        {/* Panel header */}
        <CardHeader className="cursor-pointer select-none pb-3" onClick={() => setExpanded((v) => !v)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100">
                <ShieldAlert className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-base">Панель администратора</CardTitle>
                <CardDescription className="text-xs">
                  Управление пользователями и контентом
                </CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}>
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>

        {expanded && (
          <>
            <Separator />

            {/* Tabs */}
            <div className="flex gap-1 border-b px-6 pt-4">
              {([
                { key: 'users', label: 'Пользователи', icon: Users, count: users.length },
                { key: 'news', label: 'Новости', icon: Newspaper, count: news.length },
              ] as const).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'flex items-center gap-2 rounded-t-md border border-b-0 px-4 py-2 text-sm font-medium transition-colors',
                    activeTab === tab.key
                      ? 'border-border bg-background text-foreground -mb-px'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                  <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            <CardContent className="p-0">
              {/* Users table */}
              {activeTab === 'users' && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Пользователь</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Роль</TableHead>
                      <TableHead className="w-16 text-right">Удалить</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => {
                      const isSelf = String(u.id) === currentUserId;
                      return (
                        <TableRow key={u.id} className={isSelf ? 'bg-muted/30' : ''}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold uppercase">
                                {u.full_name.charAt(0)}
                              </div>
                              <span className="font-medium">
                                {u.full_name}
                                {isSelf && <span className="ml-1 text-xs text-muted-foreground">(вы)</span>}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{u.email}</TableCell>
                          <TableCell>
                            <Select
                              value={u.role}
                              disabled={isSelf || busy === u.id}
                              onValueChange={(val) => handleChangeRole(u.id, val)}
                            >
                              <SelectTrigger className="h-7 w-28 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">admin</SelectItem>
                                <SelectItem value="analyst">analyst</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                              disabled={isSelf || busy === u.id}
                              onClick={() => askConfirm('deleteUser', u.id, u.full_name)}
                            >
                              {busy === u.id
                                ? <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                                : <Trash2 className="h-3.5 w-3.5" />
                              }
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}

              {/* News table */}
              {activeTab === 'news' && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Заголовок</TableHead>
                      <TableHead>Источник</TableHead>
                      <TableHead>Дата</TableHead>
                      <TableHead>Тональность</TableHead>
                      <TableHead className="w-16 text-right">Удалить</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {news.map((item) => {
                      const s = sentimentText(item.sentiment);
                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <span className="line-clamp-1 max-w-xs font-medium">{item.title}</span>
                          </TableCell>
                          <TableCell>
                            <span className="rounded bg-muted px-1.5 py-0.5 text-xs">{item.source_name}</span>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                            {formatDate(item.published_at)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={s.variant} className="text-[10px]">{s.label}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                              disabled={busy === item.id}
                              onClick={() => askConfirm('deleteNews', item.id, item.title)}
                            >
                              {busy === item.id
                                ? <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                                : <Trash2 className="h-3.5 w-3.5" />
                              }
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </>
        )}
      </Card>

      {/* Confirm Dialog */}
      <Dialog open={confirm.open} onOpenChange={(o) => !o && setConfirm((s) => ({ ...s, open: false }))}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <DialogTitle>Подтвердите удаление</DialogTitle>
                <DialogDescription className="mt-0.5">Это действие нельзя отменить</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <p className="rounded-lg bg-muted px-4 py-3 text-sm">
            <span className="text-muted-foreground">
              {confirm.type === 'deleteUser' ? 'Пользователь: ' : 'Новость: '}
            </span>
            <strong className="line-clamp-2">{confirm.targetLabel}</strong>
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirm((s) => ({ ...s, open: false }))}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleConfirmed} disabled={busy === confirm.targetId}>
              {busy === confirm.targetId
                ? <span className="flex items-center gap-2"><RefreshCw className="h-3.5 w-3.5 animate-spin" />Удаление...</span>
                : <span className="flex items-center gap-2"><Trash2 className="h-3.5 w-3.5" />Удалить</span>
              }
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
