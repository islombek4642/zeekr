import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCarModelBySlug } from '@/lib/data-provider';
import { CarModelEditClient } from '@/components/admin/CarModelEditClient';

export const dynamic = 'force-dynamic';

interface AdminCarEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminCarEditPage({ params }: AdminCarEditPageProps) {
  const { id } = await params;

  let model: any = null;
  try {
    model = await prisma.carModel.findUnique({
      where: { id },
      include: {
        trims: true,
        colors: true,
      },
    });

    if (!model) {
      model = await prisma.carModel.findUnique({
        where: { slug: id },
        include: {
          trims: true,
          colors: true,
        },
      });
    }
  } catch (err) {
    console.error('Error fetching car model in admin edit:', err);
  }

  // Fallback to json-db provider if DB is unseeded or down
  if (!model) {
    model = await getCarModelBySlug(id);
  }

  if (!model) {
    notFound();
  }

  return <CarModelEditClient model={model} />;
}
