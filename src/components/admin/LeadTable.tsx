'use client';

import React, { useState } from 'react';
import { LeadStatusBadge } from './LeadStatusBadge';
import { updateLeadStatusAction } from '@/app/actions/adminLeadActions';
import { formatPhoneNumber } from '@/lib/utils';
import {
  Phone,
  Send,
  Calendar,
  Clock,
  Search,
  MessageSquare,
  ChevronDown,
  Check,
  AlertCircle,
} from 'lucide-react';

interface LeadItem {
  id: string;
  fullName: string;
  phone: string;
  type: string;
  status: string;
  preferredDate: Date | string | null;
  preferredTime: string | null;
  managerNotes: string | null;
  source: string | null;
  createdAt: Date | string;
  model: {
    name: string;
  } | null;
  inventoryItem: {
    vinOrCode: string | null;
    exteriorColor: string;
    trim: {
      name: string;
      model: {
        name: string;
      };
    };
  } | null;
}

interface LeadTableProps {
  initialLeads: LeadItem[];
}

export function LeadTable({ initialLeads }: LeadTableProps) {
  const [leads, setLeads] = useState<LeadItem[]>(initialLeads);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeNoteModalLeadId, setActiveNoteModalLeadId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState<string>('');
  const [updatingLeadId, setUpdatingLeadId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const statusOptions = [
    { label: 'Barchasi', value: 'ALL' },
    { label: 'Yangi', value: 'NEW' },
    { label: 'Bog’lanildi', value: 'CONTACTED' },
    { label: 'Belgilandi', value: 'SCHEDULED' },
    { label: 'Shartnoma', value: 'DEAL_WON' },
    { label: 'Bekor', value: 'CANCELLED' },
  ];

  const filteredLeads = leads.filter((lead) => {
    if (filterStatus !== 'ALL' && lead.status !== filterStatus) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = lead.fullName.toLowerCase().includes(q);
      const matchPhone = lead.phone.includes(q);
      const matchModel =
        lead.model?.name.toLowerCase().includes(q) ||
        lead.inventoryItem?.trim.model.name.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchModel) {
        return false;
      }
    }
    return true;
  });

  const handleStatusChange = async (leadId: string, nextStatus: string) => {
    setErrorMsg('');
    setUpdatingLeadId(leadId);

    const res = await updateLeadStatusAction(leadId, nextStatus);
    if (!res.success) {
      setErrorMsg(res.error || 'Statusni yangilashda xatolik yuz berdi');
      setUpdatingLeadId(null);
      return;
    }

    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: nextStatus } : l))
    );
    setUpdatingLeadId(null);
  };

  const handleSaveNote = async (leadId: string) => {
    if (!newNote.trim()) return;
    setErrorMsg('');
    setUpdatingLeadId(leadId);

    const targetLead = leads.find((l) => l.id === leadId);
    const res = await updateLeadStatusAction(leadId, targetLead ? targetLead.status : 'CONTACTED', newNote);
    if (!res.success) {
      setErrorMsg(res.error || 'Izohni saqlashda xatolik');
      setUpdatingLeadId(null);
      return;
    }

    const timestamp = new Date().toLocaleString('uz-UZ');
    const appended = `[${timestamp}] ${newNote.trim()}`;

    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? {
              ...l,
              managerNotes: l.managerNotes ? `${l.managerNotes}\n${appended}` : appended,
            }
          : l
      )
    );

    setNewNote('');
    setActiveNoteModalLeadId(null);
    setUpdatingLeadId(null);
  };

  return (
    <div className="space-y-6">
      
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* FILTERS & SEARCH BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
        
        {/* STATUS PILLS */}
        <div className="flex flex-wrap items-center gap-1.5">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilterStatus(opt.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterStatus === opt.value
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              {opt.label}
              {opt.value !== 'ALL' && (
                <span className="ml-1.5 opacity-60 text-[10px] font-mono">
                  {leads.filter((l) => l.status === opt.value).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* SEARCH INPUT */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Mijoz ismi yoki telefoni..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50/50"
          />
        </div>

      </div>

      {/* LEADS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {filteredLeads.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Tanlangan filtrlarga mos arizalar mavjud emas.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3">Mijoz / Aloqa</th>
                  <th className="px-5 py-3">Ariza turi</th>
                  <th className="px-5 py-3">Avtomobil</th>
                  <th className="px-5 py-3">Kutilgan sana & vaqt</th>
                  <th className="px-5 py-3">Holat (Pipeline)</th>
                  <th className="px-5 py-3">Menejer izohi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeads.map((lead) => {
                  const rawPhone = lead.phone.replace(/\D/g, '');
                  const cleanPhone = rawPhone.startsWith('998') ? rawPhone : `998${rawPhone}`;
                  const tgLink = `https://t.me/+${cleanPhone}`;

                  const vehicleDisplay =
                    lead.inventoryItem
                      ? `${lead.inventoryItem.trim.model.name} (${lead.inventoryItem.exteriorColor})`
                      : lead.model
                      ? lead.model.name
                      : 'Umumiy';

                  return (
                    <tr key={lead.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* CLIENT & CONTACTS */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900 text-sm">
                          {lead.fullName}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <a
                            href={`tel:${lead.phone}`}
                            className="font-mono text-slate-600 hover:text-emerald-600 flex items-center gap-1 hover:underline"
                          >
                            <Phone className="w-3 h-3 text-slate-400" />
                            {formatPhoneNumber(lead.phone)}
                          </a>
                          <a
                            href={tgLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-sky-500 transition-colors p-0.5"
                            title="Telegram orqali yozish"
                          >
                            <Send className="w-3 h-3" />
                          </a>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {new Date(lead.createdAt).toLocaleString('uz-UZ')}
                        </div>
                      </td>

                      {/* LEAD TYPE */}
                      <td className="px-5 py-4">
                        <span className="font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md text-[11px] inline-block">
                          {lead.type === 'TEST_DRIVE'
                            ? 'Test-drayv'
                            : lead.type === 'CAR_RESERVE'
                            ? 'Bron qilish'
                            : lead.type === 'SERVICE'
                            ? 'Servis'
                            : 'Konsultatsiya'}
                        </span>
                      </td>

                      {/* VEHICLE */}
                      <td className="px-5 py-4 font-semibold text-slate-900">
                        <div>{vehicleDisplay}</div>
                        {lead.inventoryItem?.vinOrCode && (
                          <div className="text-[10px] font-mono text-slate-400 font-normal">
                            VIN: {lead.inventoryItem.vinOrCode}
                          </div>
                        )}
                      </td>

                      {/* APPOINTMENT DATE */}
                      <td className="px-5 py-4 text-slate-600">
                        {lead.preferredDate ? (
                          <div className="space-y-0.5">
                            <div className="font-semibold text-slate-800 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {new Date(lead.preferredDate).toLocaleDateString('uz-UZ')}
                            </div>
                            {lead.preferredTime && (
                              <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {lead.preferredTime}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Belgilanmagan</span>
                        )}
                      </td>

                      {/* STATUS SELECTOR */}
                      <td className="px-5 py-4">
                        <div className="space-y-1.5">
                          <LeadStatusBadge status={lead.status} />
                          <div>
                            <select
                              value={lead.status}
                              disabled={updatingLeadId === lead.id}
                              onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                              className="text-[11px] font-medium bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900"
                            >
                              <option value="NEW">Yangi</option>
                              <option value="CONTACTED">Bog’lanildi</option>
                              <option value="SCHEDULED">Belgilandi</option>
                              <option value="DEAL_WON">Shartnoma qilindi</option>
                              <option value="CANCELLED">Bekor qilindi</option>
                            </select>
                          </div>
                        </div>
                      </td>

                      {/* MANAGER NOTES */}
                      <td className="px-5 py-4">
                        <div className="max-w-xs space-y-1.5">
                          {lead.managerNotes ? (
                            <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 whitespace-pre-wrap font-mono leading-relaxed line-clamp-3">
                              {lead.managerNotes}
                            </p>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic block">
                              Izoh yo&apos;q
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setActiveNoteModalLeadId(lead.id);
                              setNewNote('');
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-900 hover:underline"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>Izoh qo&apos;shish</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD NOTE MODAL */}
      {activeNoteModalLeadId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Menejer izohi qo&apos;shish
            </h3>
            <textarea
              rows={3}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Mijoz bilan suhbat natijasi, kelishilgan vaqt yoki qo'shimcha ma'lumot..."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveNoteModalLeadId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={() => handleSaveNote(activeNoteModalLeadId)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-sm"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
