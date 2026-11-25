'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import {
  carModelFormSchema,
  carTrimFormSchema,
  carColorFormSchema,
  inventoryItemFormSchema,
  CarModelFormData,
  CarTrimFormData,
  CarColorFormData,
  InventoryItemFormData,
} from '@/lib/validations/car';
import { getAdminSession } from '@/lib/auth';

// Helper to verify admin session
async function requireAdmin() {
  const session = await getAdminSession();
  if (!session || session.role !== 'ADMIN') {
    return null;
  }
  return session;
}

// ==========================================
// 1. CAR MODEL ACTIONS
// ==========================================

export async function toggleCarModelActiveAction(modelId: string, isActive: boolean) {
  try {
    const session = await requireAdmin();
    if (!session) return { success: false, error: 'Ruxsat berilmagan' };

    let target = await prisma.carModel.findUnique({ where: { id: modelId } });
    if (!target) {
      target = await prisma.carModel.findUnique({ where: { slug: modelId } });
    }
    if (!target) {
      return { success: false, error: 'Model topilmadi' };
    }

    await prisma.carModel.update({
      where: { id: target.id },
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
    const session = await requireAdmin();
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

    const formattedSlug = slug.toLowerCase().trim();

    // Check duplicate slug
    const existing = await prisma.carModel.findUnique({
      where: { slug: formattedSlug },
    });
    if (existing) {
      return { success: false, error: 'Ushbu slug bilan model allaqachon mavjud' };
    }

    const count = await prisma.carModel.count();

    const model = await prisma.carModel.create({
      data: {
        name,
        slug: formattedSlug,
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
    revalidatePath('/models');
    return { success: true, modelId: model.id };
  } catch (err: any) {
    return { success: false, error: err.message || 'Modelni yaratishda xatolik' };
  }
}

export async function updateCarModelAction(modelId: string, input: Partial<CarModelFormData>) {
  try {
    const session = await requireAdmin();
    if (!session) return { success: false, error: 'Ruxsat berilmagan' };

    let targetModel = await prisma.carModel.findUnique({
      where: { id: modelId },
    });
    if (!targetModel) {
      targetModel = await prisma.carModel.findUnique({
        where: { slug: modelId },
      });
    }

    if (!targetModel) {
      return { success: false, error: 'Model topilmadi' };
    }

    const updateData: any = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.tagline !== undefined) updateData.tagline = input.tagline;
    if (input.basePriceUSD !== undefined) updateData.basePriceUSD = Number(input.basePriceUSD);
    if (input.rangeKm !== undefined) updateData.rangeKm = Number(input.rangeKm);
    if (input.acceleration0100 !== undefined) updateData.acceleration0100 = Number(input.acceleration0100);
    if (input.batteryKwh !== undefined) updateData.batteryKwh = Number(input.batteryKwh);
    if (input.powerHp !== undefined) updateData.powerHp = Number(input.powerHp);
    if (input.topSpeedKmH !== undefined) updateData.topSpeedKmH = Number(input.topSpeedKmH);
    if (input.chargingTimeMin !== undefined) updateData.chargingTimeMin = Number(input.chargingTimeMin);
    if (input.mainImage !== undefined) updateData.mainImage = input.mainImage;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.galleryImages !== undefined) updateData.galleryImages = input.galleryImages;
    if (input.isActive !== undefined) updateData.isActive = Boolean(input.isActive);

    if (input.slug !== undefined) {
      const formattedSlug = input.slug.toLowerCase().trim();
      const conflict = await prisma.carModel.findUnique({
        where: { slug: formattedSlug },
      });
      if (conflict && conflict.id !== targetModel.id) {
        return { success: false, error: 'Ushbu slug bilan boshqa model mavjud' };
      }
      updateData.slug = formattedSlug;
    }

    await prisma.carModel.update({
      where: { id: targetModel.id },
      data: updateData,
    });

    revalidatePath('/admin/cars');
    revalidatePath(`/admin/cars/${targetModel.id}`);
    revalidatePath('/');
    revalidatePath('/models');
    revalidatePath(`/models/${targetModel.slug}`);
    if (updateData.slug && updateData.slug !== targetModel.slug) {
      revalidatePath(`/models/${updateData.slug}`);
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Modelni yangilashda xatolik' };
  }
}

export async function deleteCarModelAction(modelId: string) {
  try {
    const session = await requireAdmin();
    if (!session) return { success: false, error: 'Ruxsat berilmagan' };

    let targetModel = await prisma.carModel.findUnique({
      where: { id: modelId },
    });
    if (!targetModel) {
      targetModel = await prisma.carModel.findUnique({
        where: { slug: modelId },
      });
    }

    if (!targetModel) {
      return { success: false, error: 'Model topilmadi' };
    }

    // Delete associated trims and colors if needed
    try {
      await prisma.carTrim.deleteMany({ where: { modelId: targetModel.id } });
      await prisma.carColor.deleteMany({ where: { modelId: targetModel.id } });
    } catch {}

    await prisma.carModel.delete({ where: { id: targetModel.id } });

    revalidatePath('/admin/cars');
    revalidatePath('/');
    revalidatePath('/models');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Modelni o\'chirishda xatolik' };
  }
}

// ==========================================
// 2. CAR TRIM ACTIONS
// ==========================================

export async function createCarTrimAction(input: CarTrimFormData) {
  try {
    const session = await requireAdmin();
    if (!session) return { success: false, error: 'Ruxsat berilmagan' };

    const parsed = carTrimFormSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues.map((i) => i.message).join(', ') };
    }

    const { modelId, name, priceUSD, driveType, rangeKm, acceleration, features } = parsed.data;

    // Verify model exists
    let model = await prisma.carModel.findUnique({ where: { id: modelId } });
    if (!model) {
      model = await prisma.carModel.findUnique({ where: { slug: modelId } });
    }
    if (!model) {
      return { success: false, error: 'Bog\'liq model topilmadi' };
    }

    const trim = await prisma.carTrim.create({
      data: {
        modelId: model.id,
        name,
        priceUSD,
        driveType,
        rangeKm,
        acceleration,
        features,
      },
    });

    revalidatePath('/models');
    revalidatePath(`/models/${model.slug}`);
    revalidatePath('/admin/cars');
    return { success: true, trimId: trim.id, id: trim.id };
  } catch (err: any) {
    return { success: false, error: err.message || 'Trim yaratishda xatolik' };
  }
}

export async function updateCarTrimAction(trimId: string, input: Partial<CarTrimFormData>) {
  try {
    const session = await requireAdmin();
    if (!session) return { success: false, error: 'Ruxsat berilmagan' };

    const existingTrim = await prisma.carTrim.findUnique({
      where: { id: trimId },
      include: { model: true },
    });
    if (!existingTrim) {
      return { success: false, error: 'Trim topilmadi' };
    }

    const updateData: any = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.priceUSD !== undefined) updateData.priceUSD = Number(input.priceUSD);
    if (input.driveType !== undefined) updateData.driveType = input.driveType;
    if (input.rangeKm !== undefined) updateData.rangeKm = Number(input.rangeKm);
    if (input.acceleration !== undefined) updateData.acceleration = Number(input.acceleration);
    if (input.features !== undefined) updateData.features = input.features;

    await prisma.carTrim.update({
      where: { id: trimId },
      data: updateData,
    });

    revalidatePath('/models');
    if (existingTrim.model?.slug) {
      revalidatePath(`/models/${existingTrim.model.slug}`);
    }
    revalidatePath('/admin/cars');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Trimni yangilashda xatolik' };
  }
}

export async function deleteCarTrimAction(trimId: string) {
  try {
    const session = await requireAdmin();
    if (!session) return { success: false, error: 'Ruxsat berilmagan' };

    const existingTrim = await prisma.carTrim.findUnique({
      where: { id: trimId },
      include: { model: true },
    });
    if (!existingTrim) {
      return { success: false, error: 'Trim topilmadi' };
    }

    await prisma.carTrim.delete({ where: { id: trimId } });

    revalidatePath('/models');
    if (existingTrim.model?.slug) {
      revalidatePath(`/models/${existingTrim.model.slug}`);
    }
    revalidatePath('/admin/cars');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Trimni o\'chirishda xatolik' };
  }
}

// ==========================================
// 3. CAR COLOR ACTIONS
// ==========================================

export async function createCarColorAction(input: CarColorFormData) {
  try {
    const session = await requireAdmin();
    if (!session) return { success: false, error: 'Ruxsat berilmagan' };

    const parsed = carColorFormSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues.map((i) => i.message).join(', ') };
    }

    const { modelId, name, hexCode, imageUrl, isInterior } = parsed.data;

    let model = await prisma.carModel.findUnique({ where: { id: modelId } });
    if (!model) {
      model = await prisma.carModel.findUnique({ where: { slug: modelId } });
    }
    if (!model) {
      return { success: false, error: 'Bog\'liq model topilmadi' };
    }

    const color = await prisma.carColor.create({
      data: {
        modelId: model.id,
        name,
        hexCode,
        imageUrl,
        isInterior,
      },
    });

    revalidatePath('/models');
    revalidatePath(`/models/${model.slug}`);
    revalidatePath('/admin/cars');
    return { success: true, colorId: color.id, id: color.id };
  } catch (err: any) {
    return { success: false, error: err.message || 'Rang yaratishda xatolik' };
  }
}

export async function updateCarColorAction(colorId: string, input: Partial<CarColorFormData>) {
  try {
    const session = await requireAdmin();
    if (!session) return { success: false, error: 'Ruxsat berilmagan' };

    const existingColor = await prisma.carColor.findUnique({
      where: { id: colorId },
      include: { model: true },
    });
    if (!existingColor) {
      return { success: false, error: 'Rang topilmadi' };
    }

    const updateData: any = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.hexCode !== undefined) updateData.hexCode = input.hexCode;
    if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl;
    if (input.isInterior !== undefined) updateData.isInterior = Boolean(input.isInterior);

    await prisma.carColor.update({
      where: { id: colorId },
      data: updateData,
    });

    revalidatePath('/models');
    if (existingColor.model?.slug) {
      revalidatePath(`/models/${existingColor.model.slug}`);
    }
    revalidatePath('/admin/cars');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Rangni yangilashda xatolik' };
  }
}

export async function deleteCarColorAction(colorId: string) {
  try {
    const session = await requireAdmin();
    if (!session) return { success: false, error: 'Ruxsat berilmagan' };

    const existingColor = await prisma.carColor.findUnique({
      where: { id: colorId },
      include: { model: true },
    });
    if (!existingColor) {
      return { success: false, error: 'Rang topilmadi' };
    }

    await prisma.carColor.delete({ where: { id: colorId } });

    revalidatePath('/models');
    if (existingColor.model?.slug) {
      revalidatePath(`/models/${existingColor.model.slug}`);
    }
    revalidatePath('/admin/cars');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Rangni o\'chirishda xatolik' };
  }
}

// ==========================================
// 4. INVENTORY ITEM ACTIONS
// ==========================================

export async function createInventoryItemAction(input: InventoryItemFormData) {
  try {
    const session = await requireAdmin();
    if (!session) return { success: false, error: 'Ruxsat berilmagan' };

    const parsed = inventoryItemFormSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues.map((i) => i.message).join(', ') };
    }

    const { trimId, vinOrCode, exteriorColor, interiorColor, year, status, priceUSD, priceUZS, notes, images } = parsed.data;

    // Check duplicate vinOrCode
    if (vinOrCode) {
      const existing = await prisma.inventoryItem.findFirst({
        where: { vinOrCode: vinOrCode.trim() },
      });
      if (existing) {
        return { success: false, error: 'Bu VIN kodli avtomobil allaqachon mavjud' };
      }
    }

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

export async function updateInventoryItemAction(itemId: string, input: Partial<InventoryItemFormData>) {
  try {
    const session = await requireAdmin();
    if (!session) return { success: false, error: 'Ruxsat berilmagan' };

    let targetItem = await prisma.inventoryItem.findUnique({
      where: { id: itemId },
    });
    if (!targetItem) {
      targetItem = await prisma.inventoryItem.findFirst({
        where: { vinOrCode: itemId },
      });
    }

    if (!targetItem) {
      return { success: false, error: 'Avtomobil topilmadi' };
    }

    const updateData: any = {};
    if (input.trimId !== undefined) updateData.trimId = input.trimId;
    if (input.exteriorColor !== undefined) updateData.exteriorColor = input.exteriorColor;
    if (input.interiorColor !== undefined) updateData.interiorColor = input.interiorColor;
    if (input.year !== undefined) updateData.year = Number(input.year);
    if (input.status !== undefined) updateData.status = input.status;
    if (input.priceUSD !== undefined) updateData.priceUSD = Number(input.priceUSD);
    if (input.priceUZS !== undefined) updateData.priceUZS = input.priceUZS ? Number(input.priceUZS) : null;
    if (input.notes !== undefined) updateData.notes = input.notes;
    if (input.images !== undefined) updateData.images = input.images;

    if (input.vinOrCode !== undefined) {
      const formattedVin = input.vinOrCode?.trim() || null;
      if (formattedVin) {
        const conflict = await prisma.inventoryItem.findFirst({
          where: { vinOrCode: formattedVin },
        });
        if (conflict && conflict.id !== targetItem.id) {
          return { success: false, error: 'Bu VIN kodli boshqa avtomobil allaqachon mavjud' };
        }
      }
      updateData.vinOrCode = formattedVin;
    }

    await prisma.inventoryItem.update({
      where: { id: targetItem.id },
      data: updateData,
    });

    revalidatePath('/admin/inventory');
    revalidatePath(`/admin/inventory/${targetItem.id}`);
    revalidatePath('/inventory');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Avtomobilni yangilashda xatolik' };
  }
}

export async function updateInventoryStatusAction(itemId: string, status: string) {
  try {
    const session = await requireAdmin();
    if (!session) return { success: false, error: 'Ruxsat berilmagan' };

    let targetItem = await prisma.inventoryItem.findUnique({
      where: { id: itemId },
    });
    if (!targetItem) {
      targetItem = await prisma.inventoryItem.findFirst({
        where: { vinOrCode: itemId },
      });
    }

    if (!targetItem) {
      return { success: false, error: 'Avtomobil topilmadi' };
    }

    await prisma.inventoryItem.update({
      where: { id: targetItem.id },
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
    const session = await requireAdmin();
    if (!session) return { success: false, error: 'Ruxsat berilmagan' };

    let targetItem = await prisma.inventoryItem.findUnique({
      where: { id: itemId },
    });
    if (!targetItem) {
      targetItem = await prisma.inventoryItem.findFirst({
        where: { vinOrCode: itemId },
      });
    }

    if (!targetItem) {
      return { success: false, error: 'Avtomobil topilmadi' };
    }

    await prisma.inventoryItem.delete({
      where: { id: targetItem.id },
    });

    revalidatePath('/admin/inventory');
    revalidatePath('/inventory');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
