'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { isValidStatusTransition } from '@/lib/lead-workflow';

export async function updateLeadStatusAction(
  leadId: string,
  newStatus: string,
  managerNote?: string
) {
  try {
    const existing = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!existing) {
      return { success: false, error: 'Ariza topilmadi' };
    }

    if (!isValidStatusTransition(existing.status, newStatus)) {
      return {
        success: false,
        error: `${existing.status} statusidan ${newStatus} ga o'tishga ruxsat berilmagan`,
      };
    }

    let updatedNotes = existing.managerNotes || '';
    if (managerNote && managerNote.trim()) {
      const timestamp = new Date().toLocaleString('uz-UZ');
      const noteEntry = `[${timestamp}] ${managerNote.trim()}`;
      updatedNotes = updatedNotes ? `${updatedNotes}\n${noteEntry}` : noteEntry;
    }

    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: newStatus as any,
        managerNotes: updatedNotes || null,
      },
    });

    revalidatePath('/admin/leads');
    revalidatePath('/admin');
    return { success: true };
  } catch (err: any) {
    console.error('updateLeadStatusAction error:', err);
    return { success: false, error: err.message || 'Statusni yangilashda xatolik' };
  }
}
