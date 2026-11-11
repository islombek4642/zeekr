'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { carModelFormSchema, inventoryItemFormSchema, CarModelFormData, InventoryItemFormData } from '@/lib/validations/car';
import { getAdminSession } from '@/lib/auth';

export async function toggleCarModelActiveAction(modelId: string, isActive: boolean) {
  try {
    const session = await getAdminSession();
    if (!session) return { success: false, error: 'Ruxsat berilmagan' };

    await prisma.carModel.update({
      where: { id: modelId },
      data: { isActive },
    });
    revalidatePath('/admin/cars');
    revalidatePath('/');
    revalidatePath('/models');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function createCarModelAction(input: CarModelFormData) {
  try {
    const session = await getAdminSession();
    if (!session) return { success: false, error: 'Ruxsat berilmagan' };

    const parsed = carModelFormSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues.map((i) => i.message).join(', ') };
    }

    const {
      name,
      slug,
      tagline,
      basePriceUSD,
      rangeKm,
      acceleration0100,
      batteryKwh,
      powerHp,
      topSpeedKmH,
      chargingTimeMin,
      mainImage,
      description,
      galleryImages,
      isActive,
    } = parsed.data;

    const count = await prisma.carModel.count();

    const model = await prisma.carModel.create({
      data: {
        name,
        slug: slug.toLowerCase().trim(),
        tagline,
        basePriceUSD,
        rangeKm,
        acceleration0100,
        batteryKwh,
        powerHp,
        topSpeedKmH,
        chargingTimeMin,
        mainImage,
        description,
        galleryImages,
        isActive,
        orderIndex: count + 1,
      },
    });

    revalidatePath('/admin/cars');
    revalidatePath('/');
    return { success: true, modelId: model.id };
  } catch (err: any) {
    return { success: false, error: err.message || 'Modelni yaratishda xatolik' };
  }
}

export async function createInventoryItemAction(input: InventoryItemFormData) {
  try {
    const session = await getAdminSession();
    if (!session) return { success: false, error: 'Ruxsat berilmagan' };

    const parsed = inventoryItemFormSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues.map((i) => i.message).join(', ') };
    }

    const { trimId, vinOrCode, exteriorColor, interiorColor, year, status, priceUSD, priceUZS, notes, images } = parsed.data;

    const item = await prisma.inventoryItem.create({
      data: {
        trimId,
        vinOrCode: vinOrCode || null,
        exteriorColor,
        interiorColor,
        year,
        status: status as any,
        priceUSD,
        priceUZS: priceUZS || null,
        notes: notes || null,
        images,
      },
    });

    revalidatePath('/admin/inventory');
    revalidatePath('/inventory');
    return { success: true, itemId: item.id };
  } catch (err: any) {
    return { success: false, error: err.message || 'Avtomobilni omborga kiritishda xatolik' };
  }
}

export async function updateInventoryStatusAction(itemId: string, status: string) {
  try {
    const session = await getAdminSession();
    if (!session) return { success: false, error: 'Ruxsat berilmagan' };

    await prisma.inventoryItem.update({
      where: { id: itemId },
      data: { status: status as any },
    });

    revalidatePath('/admin/inventory');
    revalidatePath('/inventory');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteInventoryItemAction(itemId: string) {
  try {
    const session = await getAdminSession();
    if (!session) return { success: false, error: 'Ruxsat berilmagan' };

    await prisma.inventoryItem.delete({
      where: { id: itemId },
    });

    revalidatePath('/admin/inventory');
    revalidatePath('/inventory');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

