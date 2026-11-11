import { getSiteSettings } from '@/lib/settings';
import { SettingsForm } from '@/components/admin/SettingsForm';
import { Settings, ShieldCheck } from 'lucide-react';

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Sayt Sozlamalari Boshqaruvi
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Showroom manzili, aloqa raqamlari, valyuta kursi va Telegram bildirishnomalari (Kodda hardcode yo&apos;q)
          </p>
        </div>
      </div>

      <SettingsForm initialSettings={settings} />

    </div>
  );
}
