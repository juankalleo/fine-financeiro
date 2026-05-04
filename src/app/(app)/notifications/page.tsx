'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAppData } from '@/lib/data/store';
import { formatDateTime } from '@/lib/helpers';
import { Header } from '@/components/layout/header';
import {
  Bell,
  Mail,
  CreditCard,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function NotificationsPage() {
  const { data } = useAppData();

  const getIcon = (type: string) => {
    switch (type) {
      case 'email_sent': return <Mail className="w-4 h-4 text-blue-500" />;
      case 'auto_payment': return <CreditCard className="w-4 h-4 text-emerald-500" />;
      case 'alert': return <AlertCircle className="w-4 h-4 text-amber-500" />;
      default: return <Bell className="w-4 h-4 text-purple-500" />;
    }
  };

  return (
    <>
      <Header
        title="Centro de Avisos"
        subtitle={`${data.notifications.length} notificações registradas`}
      />

      <div className="space-y-4 max-w-2xl mx-auto">
        {data.notifications.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-10 h-10 text-muted-foreground/30" />
            </div>
            <h3 className="text-lg font-medium">Tudo tranquilo!</h3>
            <p className="text-sm text-muted-foreground">Nenhum aviso importante por enquanto.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {data.notifications.map((notif, i) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white dark:bg-zinc-900 rounded-2xl border border-border/40 p-4 flex gap-4 hover:shadow-md transition-all"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    notif.type === 'email_sent' ? 'bg-blue-50 dark:bg-blue-900/20' : 
                    notif.type === 'auto_payment' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 
                    'bg-amber-50 dark:bg-amber-900/20'
                  }`}>
                    {getIcon(notif.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-semibold text-foreground">{notif.title}</h4>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {formatDateTime(notif.date)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                    
                    {notif.type === 'email_sent' && (
                      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-blue-500 font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        Email enviado com sucesso
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </>
  );
}
