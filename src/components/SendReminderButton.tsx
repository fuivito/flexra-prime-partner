import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MessageSquare, Mail, Phone, Bell } from 'lucide-react';
import { toast } from 'sonner';

interface SendReminderButtonProps {
  clientName: string;
  instalmentNumber: number;
  amount: string;
  /** Compact mode for inline/list usage */
  compact?: boolean;
}

const channels = [
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'sms', label: 'SMS', icon: Phone },
] as const;

export default function SendReminderButton({ clientName, instalmentNumber, amount, compact = false }: SendReminderButtonProps) {
  const handleSend = (channel: string) => {
    toast.success(`Reminder sent via ${channel}`, {
      description: `Payment reminder for instalment #${instalmentNumber} (${amount}) sent to ${clientName}.`,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {compact ? (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-accent" title="Send reminder">
            <Bell className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <Bell className="h-3.5 w-3.5" /> Send Reminder
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
