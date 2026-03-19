import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MessageSquare, Mail, Phone, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { useLocale } from '@/i18n/LocaleContext';

interface SendReminderButtonProps {
  clientName: string;
  instalmentNumber: number;
  amount: string;
  compact?: boolean;
}

export default function SendReminderButton({ clientName, instalmentNumber, amount, compact = false }: SendReminderButtonProps) {
  const { t } = useLocale();

  const channels = [
    { id: 'whatsapp', label: t.components.sendReminder.whatsapp, icon: MessageSquare },
    { id: 'email', label: t.components.sendReminder.emailLabel, icon: Mail },
    { id: 'sms', label: t.components.sendReminder.sms, icon: Phone },
  ] as const;

  const handleSend = (channel: string) => {
    toast.success(t.components.sendReminder.reminderSent(channel), {
      description: t.components.sendReminder.reminderDesc(instalmentNumber, amount, clientName),
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {compact ? (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-accent" title={t.components.sendReminder.sendReminder}>
            <Bell className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <Bell className="h-3.5 w-3.5" /> {t.components.sendReminder.sendReminder}
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {channels.map((ch) => (
          <DropdownMenuItem key={ch.id} onClick={() => handleSend(ch.label)} className="gap-2 cursor-pointer">
            <ch.icon className="h-4 w-4" />
            {ch.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
