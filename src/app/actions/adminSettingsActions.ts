'use server';

import { updateSiteSettings } from '@/lib/settings';
import { settingsFormSchema, SettingsFormData } from '@/lib/validations/settings';
import { revalidatePath } from 'next/cache';
import { getAdminSession } from '@/lib/auth';

export async function updateSettingsAction(input: SettingsFormData) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return {
        success: false,
        error: 'Ruxsat berilmagan: administrator sessiyasi topilmadi',
      };
    }

    const parsed = settingsFormSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues.map((i) => i.message).join(', '),
      };
    }

    await updateSiteSettings(parsed.data);

    // Revalidate public layouts and pages so updated phones/rates reflect instantly
    revalidatePath('/', 'layout');
    revalidatePath('/admin/settings');
    revalidatePath('/inventory');
    revalidatePath('/contacts');
    revalidatePath('/service');

    return { success: true };
  } catch (err: any) {
    console.error('updateSettingsAction error:', err);
    return {
      success: false,
      error: err.message || 'Sozlamalarni yangilashda xatolik yuz berdi',
    };
  }
}

