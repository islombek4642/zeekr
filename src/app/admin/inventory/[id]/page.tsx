import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { InventoryItemEditClient } from '@/components/admin/InventoryItemEditClient';

export const dynamic = 'force-dynamic';

interface AdminInventoryEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminInventoryEditPage({ params }: AdminInventoryEditPageProps) {
  const { id } = await params;

  let item: any = null;
  let models: any[] = [];

  try {
    item = await prisma.inventoryItem.findUnique({
      where: { id },
      include: {
        trim: {
          include: {
            model: true,
          },
        },
      },
    });

    if (!item) {
      item = await prisma.inventoryItem.findFirst({
        where: { vinOrCode: id },
        include: {
          trim: {
            include: {
              model: true,
            },
          },
        },
      });
    }

    models = await prisma.carModel.findMany({
      where: { isActive: true },
      include: {
        trims: true,
        colors: true,
      },
      orderBy: { orderIndex: 'asc' },
    });
  } catch (err) {
    console.error('Error fetching inventory item in admin edit:', err);
  }

  if (!item) {
    notFound();
  }

  return <InventoryItemEditClient item={item} models={models} />;
}
