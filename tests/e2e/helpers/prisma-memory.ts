import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

type RecordAny = Record<string, any>;

function createPrismaError(code: string, message: string, meta?: Record<string, unknown>) {
  const err = new Error(message) as Error & { code: string; meta?: Record<string, unknown> };
  err.code = code;
  if (meta) err.meta = meta;
  return err;
}

function getDataDir(): string {
  return path.resolve(process.cwd(), 'data');
}

function readJson<T>(filename: string): T {
  const filePath = path.join(getDataDir(), filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
}

const ADMIN_HASH = bcrypt.hashSync('Admin123!', 4);
const MANAGER_HASH = bcrypt.hashSync('Manager123!', 4);
const USER_HASH = bcrypt.hashSync('User123!', 4);

let idCounter = 1;
function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

function matchesWhere(row: RecordAny, where?: RecordAny): boolean {
  if (!where) return true;
  for (const [key, cond] of Object.entries(where)) {
    if (cond === undefined) continue;
    const val = row[key];
    if (cond !== null && typeof cond === 'object' && !Array.isArray(cond) && !(cond instanceof Date)) {
      if ('in' in cond && Array.isArray(cond.in)) {
        if (!cond.in.includes(val)) return false;
      }
      if ('contains' in cond) {
        const hay = String(val ?? '');
        const needle = String(cond.contains ?? '');
        if (cond.mode === 'insensitive') {
          if (!hay.toLowerCase().includes(needle.toLowerCase())) return false;
        } else {
          if (!hay.includes(needle)) return false;
        }
      }
      if ('equals' in cond) {
        if (val !== cond.equals) return false;
      }
      if ('not' in cond) {
        if (val === cond.not) return false;
      }
    } else {
      if (val !== cond) return false;
    }
  }
  return true;
}

function sortRows(rows: RecordAny[], orderBy?: RecordAny | RecordAny[]): RecordAny[] {
  if (!orderBy) return rows;
  const clauses = Array.isArray(orderBy) ? orderBy : [orderBy];
  return [...rows].sort((a, b) => {
    for (const clause of clauses) {
      const [field, dir] = Object.entries(clause)[0] || [];
      if (!field) continue;
      const av = a[field];
      const bv = b[field];
      const cmp =
        av instanceof Date && bv instanceof Date
          ? av.getTime() - bv.getTime()
          : av < bv
            ? -1
            : av > bv
              ? 1
              : 0;
      if (cmp !== 0) return dir === 'desc' ? -cmp : cmp;
    }
    return 0;
  });
}

function applySelect(row: RecordAny, select?: RecordAny): RecordAny {
  if (!select) return { ...row };
  const out: RecordAny = {};
  for (const [k, v] of Object.entries(select)) {
    if (v) out[k] = row[k];
  }
  return out;
}

class InMemoryPrismaStore {
  dbDown = false;
  users: RecordAny[] = [];
  carModels: RecordAny[] = [];
  carTrims: RecordAny[] = [];
  carColors: RecordAny[] = [];
  inventoryItems: RecordAny[] = [];
  leads: RecordAny[] = [];
  settings: RecordAny[] = [];

  constructor() {
    this.seed();
  }

  seed(): void {
    this.dbDown = false;
    idCounter = 100;

    const now = new Date('2026-01-01T00:00:00Z');
    this.users = [
      {
        id: 'user-admin-1',
        email: 'admin@zeekr-auto.uz',
        passwordHash: ADMIN_HASH,
        name: 'Zeekr Admin',
        role: 'ADMIN',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'user-manager-1',
        email: 'manager@zeekr-auto.uz',
        passwordHash: MANAGER_HASH,
        name: 'Zeekr Manager',
        role: 'MANAGER',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'user-standard-1',
        email: 'user@zeekr-auto.uz',
        passwordHash: USER_HASH,
        name: 'Standard User',
        role: 'USER',
        createdAt: now,
        updatedAt: now,
      },
    ];

    const modelsJson = readJson<RecordAny[]>('models.json');
    const trimsJson = readJson<RecordAny[]>('trims.json');
    const colorsJson = readJson<RecordAny[]>('colors.json');
    const inventoryJson = readJson<RecordAny[]>('inventory.json');
    const settingsJson = readJson<RecordAny>('settings.json');

    this.carModels = modelsJson.map((m) => ({
      id: m.slug,
      slug: m.slug,
      name: m.name,
      tagline: m.tagline,
      basePriceUSD: m.basePriceUSD,
      acceleration0100: m.acceleration0100,
      rangeKm: m.rangeKm,
      batteryKwh: m.batteryKwh,
      powerHp: m.powerHp,
      topSpeedKmH: m.topSpeedKmH,
      chargingTimeMin: m.chargingTimeMin,
      mainImage: m.mainImage,
      galleryImages: [...(m.galleryImages || [])],
      description: m.description,
      isActive: m.isActive ?? true,
      orderIndex: m.orderIndex ?? 0,
      createdAt: now,
      updatedAt: now,
    }));

    this.carTrims = trimsJson.map((t, idx) => ({
      id: `${t.modelSlug}-trim-${idx + 1}`,
      modelId: t.modelSlug,
      name: t.name,
      priceUSD: t.priceUSD,
      driveType: t.driveType,
      rangeKm: t.rangeKm,
      acceleration: t.acceleration,
      features: [...(t.features || [])],
      createdAt: now,
      updatedAt: now,
    }));

    this.carColors = colorsJson.map((c, idx) => ({
      id: `${c.modelSlug}-color-${idx + 1}`,
      modelId: c.modelSlug,
      name: c.name,
      hexCode: c.hexCode,
      imageUrl: c.imageUrl,
      isInterior: Boolean(c.isInterior),
      createdAt: now,
      updatedAt: now,
    }));

    this.inventoryItems = inventoryJson.map((item, idx) => {
      const trim = this.carTrims.find(
        (t) => t.modelId === item.modelSlug && t.name === item.trimName
      );
      return {
        id: item.vinOrCode || `inv-${idx + 1}`,
        trimId: trim ? trim.id : `${item.modelSlug}-trim-1`,
        vinOrCode: item.vinOrCode || null,
        exteriorColor: item.exteriorColor,
        interiorColor: item.interiorColor,
        year: item.year,
        status: item.status,
        priceUSD: item.priceUSD,
        priceUZS: item.priceUZS ?? null,
        images: [...(item.images || [])],
        notes: item.notes ?? null,
        createdAt: new Date(now.getTime() + idx * 1000),
        updatedAt: now,
      };
    });

    this.settings = Object.entries(settingsJson).map(([key, value]) => ({
      key,
      value: String(value),
      updatedAt: now,
    }));

    this.leads = [];
  }

  assertDbUp(): void {
    if (this.dbDown) {
      throw new Error('PrismaClientInitializationError: Simulated database outage');
    }
  }

  hydrateModel(row: RecordAny, include?: RecordAny): RecordAny {
    const out = { ...row };
    if (!include) return out;
    if (include.trims) {
      out.trims = this.carTrims
        .filter((t) => t.modelId === row.id)
        .map((t) => ({ ...t }));
    }
    if (include.colors) {
      out.colors = this.carColors
        .filter((c) => c.modelId === row.id)
        .map((c) => ({ ...c }));
    }
    if (include._count?.select) {
      out._count = {};
      if (include._count.select.leads) {
        out._count.leads = this.leads.filter((l) => l.modelId === row.id).length;
      }
      if (include._count.select.trims) {
        out._count.trims = this.carTrims.filter((t) => t.modelId === row.id).length;
      }
      if (include._count.select.colors) {
        out._count.colors = this.carColors.filter((c) => c.modelId === row.id).length;
      }
    }
    return out;
  }

  hydrateTrim(row: RecordAny, include?: RecordAny): RecordAny {
    const out = { ...row };
    if (!include) return out;
    if (include.model) {
      const m = this.carModels.find((x) => x.id === row.modelId) || null;
      out.model = m ? { ...m } : null;
    }
    if (include.inventoryItems) {
      out.inventoryItems = this.inventoryItems
        .filter((i) => i.trimId === row.id)
        .map((i) => ({ ...i }));
    }
    return out;
  }

  hydrateInventoryItem(row: RecordAny, include?: RecordAny): RecordAny {
    const out = { ...row };
    if (!include) return out;
    if (include.trim) {
      const t = this.carTrims.find((x) => x.id === row.trimId) || null;
      out.trim = t
        ? this.hydrateTrim(t, typeof include.trim === 'object' ? include.trim.include : undefined)
        : null;
    }
    return out;
  }

  hydrateLead(row: RecordAny, include?: RecordAny): RecordAny {
    const out = { ...row };
    if (!include) return out;
    if (include.model) {
      const m = row.modelId ? this.carModels.find((x) => x.id === row.modelId) || null : null;
      out.model = m ? { ...m } : null;
    }
    if (include.inventoryItem) {
      const inv = row.inventoryItemId
        ? this.inventoryItems.find((x) => x.id === row.inventoryItemId) || null
        : null;
      out.inventoryItem = inv
        ? this.hydrateInventoryItem(
            inv,
            typeof include.inventoryItem === 'object' ? include.inventoryItem.include : undefined
          )
        : null;
    }
    return out;
  }
}

export const memoryStore = new InMemoryPrismaStore();

export function simulateDbDown(down: boolean): void {
  memoryStore.dbDown = down;
}

export function resetPrismaMemory(): void {
  memoryStore.seed();
}

const prismaModels = {
  user: {
    async findUnique({ where }: RecordAny) {
      memoryStore.assertDbUp();
      const row = memoryStore.users.find((u) => matchesWhere(u, where));
      return row ? { ...row } : null;
    },
    async findMany({ where, orderBy }: RecordAny = {}) {
      memoryStore.assertDbUp();
      let rows = memoryStore.users.filter((u) => matchesWhere(u, where));
      rows = sortRows(rows, orderBy);
      return rows.map((u) => ({ ...u }));
    },
    async create({ data }: RecordAny) {
      memoryStore.assertDbUp();
      if (memoryStore.users.some((u) => u.email === data.email)) {
        throw createPrismaError('P2002', 'Unique constraint failed on email', { target: ['email'] });
      }
      const row = {
        id: data.id || nextId('user'),
        email: data.email,
        passwordHash: data.passwordHash,
        name: data.name,
        role: data.role || 'ADMIN',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryStore.users.push(row);
      return { ...row };
    },
    async upsert({ where, update, create }: RecordAny) {
      memoryStore.assertDbUp();
      const existing = memoryStore.users.find((u) => matchesWhere(u, where));
      if (existing) {
        Object.assign(existing, update, { updatedAt: new Date() });
        return { ...existing };
      }
      return this.create({ data: create });
    },
    async count({ where }: RecordAny = {}) {
      memoryStore.assertDbUp();
      return memoryStore.users.filter((u) => matchesWhere(u, where)).length;
    },
  },

  carModel: {
    async findMany({ where, orderBy, include, select, take }: RecordAny = {}) {
      memoryStore.assertDbUp();
      let rows = memoryStore.carModels.filter((m) => matchesWhere(m, where));
      rows = sortRows(rows, orderBy);
      if (typeof take === 'number') rows = rows.slice(0, take);
      return rows.map((r) => {
        const hydrated = memoryStore.hydrateModel(r, include);
        return select ? applySelect(hydrated, select) : hydrated;
      });
    },
    async findUnique({ where, include, select }: RecordAny) {
      memoryStore.assertDbUp();
      const row = memoryStore.carModels.find((m) => matchesWhere(m, where));
      if (!row) return null;
      const hydrated = memoryStore.hydrateModel(row, include);
      return select ? applySelect(hydrated, select) : hydrated;
    },
    async findFirst({ where, orderBy, include }: RecordAny = {}) {
      memoryStore.assertDbUp();
      let rows = memoryStore.carModels.filter((m) => matchesWhere(m, where));
      rows = sortRows(rows, orderBy);
      return rows[0] ? memoryStore.hydrateModel(rows[0], include) : null;
    },
    async count({ where }: RecordAny = {}) {
      memoryStore.assertDbUp();
      return memoryStore.carModels.filter((m) => matchesWhere(m, where)).length;
    },
    async create({ data, include }: RecordAny) {
      memoryStore.assertDbUp();
      if (memoryStore.carModels.some((m) => m.slug === data.slug)) {
        throw createPrismaError('P2002', 'Unique constraint failed on slug', { target: ['slug'] });
      }
      const now = new Date();
      const row: RecordAny = {
        id: data.id || data.slug || nextId('model'),
        slug: data.slug,
        name: data.name,
        tagline: data.tagline,
        basePriceUSD: data.basePriceUSD,
        acceleration0100: data.acceleration0100,
        rangeKm: data.rangeKm,
        batteryKwh: data.batteryKwh,
        powerHp: data.powerHp,
        topSpeedKmH: data.topSpeedKmH,
        chargingTimeMin: data.chargingTimeMin,
        mainImage: data.mainImage,
        galleryImages: [...(data.galleryImages || [])],
        description: data.description,
        isActive: data.isActive ?? true,
        orderIndex: data.orderIndex ?? 0,
        createdAt: now,
        updatedAt: now,
      };
      memoryStore.carModels.push(row);
      return memoryStore.hydrateModel(row, include);
    },
    async update({ where, data, include }: RecordAny) {
      memoryStore.assertDbUp();
      const row = memoryStore.carModels.find((m) => matchesWhere(m, where));
      if (!row) throw createPrismaError('P2025', 'CarModel record not found');
      if (data.slug && memoryStore.carModels.some((m) => m.slug === data.slug && m.id !== row.id)) {
        throw createPrismaError('P2002', 'Unique constraint failed on slug', { target: ['slug'] });
      }
      Object.assign(row, data, { updatedAt: new Date() });
      return memoryStore.hydrateModel(row, include);
    },
    async upsert({ where, update, create }: RecordAny) {
      memoryStore.assertDbUp();
      const existing = memoryStore.carModels.find((m) => matchesWhere(m, where));
      if (existing) {
        Object.assign(existing, update, { updatedAt: new Date() });
        return { ...existing };
      }
      return this.create({ data: create });
    },
    async delete({ where }: RecordAny) {
      memoryStore.assertDbUp();
      const idx = memoryStore.carModels.findIndex((m) => matchesWhere(m, where));
      if (idx === -1) throw createPrismaError('P2025', 'CarModel record not found');
      const [removed] = memoryStore.carModels.splice(idx, 1);

      const childTrimIds = memoryStore.carTrims
        .filter((t) => t.modelId === removed.id)
        .map((t) => t.id);
      const childInvIds = memoryStore.inventoryItems
        .filter((i) => childTrimIds.includes(i.trimId))
        .map((i) => i.id);

      memoryStore.carTrims = memoryStore.carTrims.filter((t) => t.modelId !== removed.id);
      memoryStore.carColors = memoryStore.carColors.filter((c) => c.modelId !== removed.id);
      memoryStore.inventoryItems = memoryStore.inventoryItems.filter((i) => !childTrimIds.includes(i.trimId));
      memoryStore.leads.forEach((l) => {
        if (l.modelId === removed.id) l.modelId = null;
        if (l.inventoryItemId && childInvIds.includes(l.inventoryItemId)) l.inventoryItemId = null;
      });
      return { ...removed };
    },
  },

  carTrim: {
    async findMany({ where, orderBy, include }: RecordAny = {}) {
      memoryStore.assertDbUp();
      let rows = memoryStore.carTrims.filter((t) => matchesWhere(t, where));
      rows = sortRows(rows, orderBy);
      return rows.map((r) => memoryStore.hydrateTrim(r, include));
    },
    async findUnique({ where, include }: RecordAny) {
      memoryStore.assertDbUp();
      const row = memoryStore.carTrims.find((t) => matchesWhere(t, where));
      return row ? memoryStore.hydrateTrim(row, include) : null;
    },
    async findFirst({ where, include }: RecordAny = {}) {
      memoryStore.assertDbUp();
      const row = memoryStore.carTrims.find((t) => matchesWhere(t, where));
      return row ? memoryStore.hydrateTrim(row, include) : null;
    },
    async count({ where }: RecordAny = {}) {
      memoryStore.assertDbUp();
      return memoryStore.carTrims.filter((t) => matchesWhere(t, where)).length;
    },
    async create({ data, include }: RecordAny) {
      memoryStore.assertDbUp();
      if (!memoryStore.carModels.some((m) => m.id === data.modelId)) {
        throw createPrismaError('P2003', 'Foreign key constraint failed on modelId', { field_name: 'modelId' });
      }
      const now = new Date();
      const row = {
        id: data.id || nextId('trim'),
        modelId: data.modelId,
        name: data.name,
        priceUSD: data.priceUSD,
        driveType: data.driveType,
        rangeKm: data.rangeKm,
        acceleration: data.acceleration,
        features: [...(data.features || [])],
        createdAt: now,
        updatedAt: now,
      };
      memoryStore.carTrims.push(row);
      return memoryStore.hydrateTrim(row, include);
    },
    async update({ where, data, include }: RecordAny) {
      memoryStore.assertDbUp();
      const row = memoryStore.carTrims.find((t) => matchesWhere(t, where));
      if (!row) throw createPrismaError('P2025', 'CarTrim record not found');
      Object.assign(row, data, { updatedAt: new Date() });
      return memoryStore.hydrateTrim(row, include);
    },
    async delete({ where }: RecordAny) {
      memoryStore.assertDbUp();
      const idx = memoryStore.carTrims.findIndex((t) => matchesWhere(t, where));
      if (idx === -1) throw createPrismaError('P2025', 'CarTrim record not found');
      const [removed] = memoryStore.carTrims.splice(idx, 1);
      const childInvIds = memoryStore.inventoryItems
        .filter((i) => i.trimId === removed.id)
        .map((i) => i.id);
      memoryStore.inventoryItems = memoryStore.inventoryItems.filter((i) => i.trimId !== removed.id);
      memoryStore.leads.forEach((l) => {
        if (l.inventoryItemId && childInvIds.includes(l.inventoryItemId)) l.inventoryItemId = null;
      });
      return { ...removed };
    },
  },

  carColor: {
    async findMany({ where, orderBy }: RecordAny = {}) {
      memoryStore.assertDbUp();
      let rows = memoryStore.carColors.filter((c) => matchesWhere(c, where));
      rows = sortRows(rows, orderBy);
      return rows.map((c) => ({ ...c }));
    },
    async findUnique({ where }: RecordAny) {
      memoryStore.assertDbUp();
      const row = memoryStore.carColors.find((c) => matchesWhere(c, where));
      return row ? { ...row } : null;
    },
    async count({ where }: RecordAny = {}) {
      memoryStore.assertDbUp();
      return memoryStore.carColors.filter((c) => matchesWhere(c, where)).length;
    },
    async create({ data }: RecordAny) {
      memoryStore.assertDbUp();
      if (!memoryStore.carModels.some((m) => m.id === data.modelId)) {
        throw createPrismaError('P2003', 'Foreign key constraint failed on modelId', { field_name: 'modelId' });
      }
      const now = new Date();
      const row = {
        id: data.id || nextId('color'),
        modelId: data.modelId,
        name: data.name,
        hexCode: data.hexCode,
        imageUrl: data.imageUrl,
        isInterior: Boolean(data.isInterior),
        createdAt: now,
        updatedAt: now,
      };
      memoryStore.carColors.push(row);
      return { ...row };
    },
    async update({ where, data }: RecordAny) {
      memoryStore.assertDbUp();
      const row = memoryStore.carColors.find((c) => matchesWhere(c, where));
      if (!row) throw createPrismaError('P2025', 'CarColor record not found');
      Object.assign(row, data, { updatedAt: new Date() });
      return { ...row };
    },
    async delete({ where }: RecordAny) {
      memoryStore.assertDbUp();
      const idx = memoryStore.carColors.findIndex((c) => matchesWhere(c, where));
      if (idx === -1) throw createPrismaError('P2025', 'CarColor record not found');
      const [removed] = memoryStore.carColors.splice(idx, 1);
      return { ...removed };
    },
  },

  inventoryItem: {
    async findMany({ where, orderBy, include, take }: RecordAny = {}) {
      memoryStore.assertDbUp();
      let rows = memoryStore.inventoryItems.filter((i) => matchesWhere(i, where));
      rows = sortRows(rows, orderBy);
      if (typeof take === 'number') rows = rows.slice(0, take);
      return rows.map((r) => memoryStore.hydrateInventoryItem(r, include));
    },
    async findUnique({ where, include }: RecordAny) {
      memoryStore.assertDbUp();
      const row = memoryStore.inventoryItems.find((i) => matchesWhere(i, where));
      return row ? memoryStore.hydrateInventoryItem(row, include) : null;
    },
    async findFirst({ where, include }: RecordAny = {}) {
      memoryStore.assertDbUp();
      const row = memoryStore.inventoryItems.find((i) => matchesWhere(i, where));
      return row ? memoryStore.hydrateInventoryItem(row, include) : null;
    },
    async count({ where }: RecordAny = {}) {
      memoryStore.assertDbUp();
      return memoryStore.inventoryItems.filter((i) => matchesWhere(i, where)).length;
    },
    async create({ data, include }: RecordAny) {
      memoryStore.assertDbUp();
      if (!memoryStore.carTrims.some((t) => t.id === data.trimId)) {
        throw createPrismaError('P2003', 'Foreign key constraint failed on trimId', { field_name: 'trimId' });
      }
      if (data.vinOrCode && memoryStore.inventoryItems.some((i) => i.vinOrCode === data.vinOrCode)) {
        throw createPrismaError('P2002', 'Unique constraint failed on vinOrCode', { target: ['vinOrCode'] });
      }
      const now = new Date();
      const row = {
        id: data.id || nextId('inv'),
        trimId: data.trimId,
        vinOrCode: data.vinOrCode ?? null,
        exteriorColor: data.exteriorColor,
        interiorColor: data.interiorColor,
        year: data.year ?? 2026,
        status: data.status || 'IN_STOCK',
        priceUSD: data.priceUSD,
        priceUZS: data.priceUZS ?? null,
        images: [...(data.images || [])],
        notes: data.notes ?? null,
        createdAt: now,
        updatedAt: now,
      };
      memoryStore.inventoryItems.push(row);
      return memoryStore.hydrateInventoryItem(row, include);
    },
    async update({ where, data, include }: RecordAny) {
      memoryStore.assertDbUp();
      const row = memoryStore.inventoryItems.find((i) => matchesWhere(i, where));
      if (!row) throw createPrismaError('P2025', 'InventoryItem record not found');
      if (data.trimId && !memoryStore.carTrims.some((t) => t.id === data.trimId)) {
        throw createPrismaError('P2003', 'Foreign key constraint failed on trimId', { field_name: 'trimId' });
      }
      if (
        data.vinOrCode &&
        memoryStore.inventoryItems.some((i) => i.vinOrCode === data.vinOrCode && i.id !== row.id)
      ) {
        throw createPrismaError('P2002', 'Unique constraint failed on vinOrCode', { target: ['vinOrCode'] });
      }
      Object.assign(row, data, { updatedAt: new Date() });
      return memoryStore.hydrateInventoryItem(row, include);
    },
    async delete({ where }: RecordAny) {
      memoryStore.assertDbUp();
      const idx = memoryStore.inventoryItems.findIndex((i) => matchesWhere(i, where));
      if (idx === -1) throw createPrismaError('P2025', 'InventoryItem record not found');
      const [removed] = memoryStore.inventoryItems.splice(idx, 1);
      memoryStore.leads.forEach((l) => {
        if (l.inventoryItemId === removed.id) l.inventoryItemId = null;
      });
      return { ...removed };
    },
  },

  lead: {
    async findMany({ where, orderBy, include, take }: RecordAny = {}) {
      memoryStore.assertDbUp();
      let rows = memoryStore.leads.filter((l) => matchesWhere(l, where));
      rows = sortRows(rows, orderBy);
      if (typeof take === 'number') rows = rows.slice(0, take);
      return rows.map((r) => memoryStore.hydrateLead(r, include));
    },
    async findUnique({ where, include }: RecordAny) {
      memoryStore.assertDbUp();
      const row = memoryStore.leads.find((l) => matchesWhere(l, where));
      return row ? memoryStore.hydrateLead(row, include) : null;
    },
    async count({ where }: RecordAny = {}) {
      memoryStore.assertDbUp();
      return memoryStore.leads.filter((l) => matchesWhere(l, where)).length;
    },
    async create({ data, include }: RecordAny) {
      memoryStore.assertDbUp();
      if (data.modelId && !memoryStore.carModels.some((m) => m.id === data.modelId)) {
        throw createPrismaError('P2003', 'Foreign key constraint failed on modelId', { field_name: 'modelId' });
      }
      if (
        data.inventoryItemId &&
        !memoryStore.inventoryItems.some((i) => i.id === data.inventoryItemId)
      ) {
        throw createPrismaError('P2003', 'Foreign key constraint failed on inventoryItemId', {
          field_name: 'inventoryItemId',
        });
      }
      const now = new Date();
      const row = {
        id: data.id || nextId('lead'),
        type: data.type || 'TEST_DRIVE',
        fullName: data.fullName,
        phone: data.phone,
        modelId: data.modelId ?? null,
        inventoryItemId: data.inventoryItemId ?? null,
        preferredDate: data.preferredDate ?? null,
        preferredTime: data.preferredTime ?? null,
        status: data.status || 'NEW',
        managerNotes: data.managerNotes ?? null,
        source: data.source ?? null,
        createdAt: now,
        updatedAt: now,
      };
      memoryStore.leads.push(row);
      return memoryStore.hydrateLead(row, include);
    },
    async update({ where, data, include }: RecordAny) {
      memoryStore.assertDbUp();
      const row = memoryStore.leads.find((l) => matchesWhere(l, where));
      if (!row) throw createPrismaError('P2025', 'Lead record not found');
      Object.assign(row, data, { updatedAt: new Date() });
      return memoryStore.hydrateLead(row, include);
    },
    async delete({ where }: RecordAny) {
      memoryStore.assertDbUp();
      const idx = memoryStore.leads.findIndex((l) => matchesWhere(l, where));
      if (idx === -1) throw createPrismaError('P2025', 'Lead record not found');
      const [removed] = memoryStore.leads.splice(idx, 1);
      return { ...removed };
    },
  },

  setting: {
    async findMany({ where }: RecordAny = {}) {
      memoryStore.assertDbUp();
      return memoryStore.settings.filter((s) => matchesWhere(s, where)).map((s) => ({ ...s }));
    },
    async findUnique({ where }: RecordAny) {
      memoryStore.assertDbUp();
      const row = memoryStore.settings.find((s) => matchesWhere(s, where));
      return row ? { ...row } : null;
    },
    async upsert({ where, update, create }: RecordAny) {
      memoryStore.assertDbUp();
      const existing = memoryStore.settings.find((s) => matchesWhere(s, where));
      if (existing) {
        Object.assign(existing, update, { updatedAt: new Date() });
        return { ...existing };
      }
      const row = {
        key: create.key,
        value: String(create.value),
        updatedAt: new Date(),
      };
      memoryStore.settings.push(row);
      return { ...row };
    },
    async count({ where }: RecordAny = {}) {
      memoryStore.assertDbUp();
      return memoryStore.settings.filter((s) => matchesWhere(s, where)).length;
    },
  },

};

export const prismaMemoryClient = {
  ...prismaModels,
  async $transaction<T>(
    fnOrOps: ((tx: typeof prismaModels) => Promise<T>) | Promise<unknown>[]
  ): Promise<T | unknown[]> {
    memoryStore.assertDbUp();
    if (Array.isArray(fnOrOps)) {
      return Promise.all(fnOrOps);
    }
    return fnOrOps(prismaModels);
  },
};
