import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { createBlankManagerialWorkbook, type ManagerialSaveStatus, type ManagerialWorkbook, type ManagerialWorkbookInput, type ManagerialWorkbookUpdates } from '@/types/managerial';

interface DraftStore {
  workbooks: ManagerialWorkbook[];
  dirty: Record<string, number>;
  tombstones: Record<string, number>;
  heads: Record<string, string[]>;
  tokens: Record<string, string>;
  deleted: Set<string>;
}

interface RecoveryEvent {
  version: 2;
  id: string;
  workbookId: string;
  parents: string[];
  kind: 'edit' | 'delete' | 'saved' | 'deleted';
  workbook?: ManagerialWorkbook;
  target?: string;
}

export interface ManagerialLoadError {
  kind: 'missing-table' | 'network' | 'data';
  message: string;
}

export interface ManagerialDeleteResult {
  deleted: boolean;
  pending: boolean;
  error?: string;
}

export interface ManagerialContextType {
  workbooks: ManagerialWorkbook[];
  currentWorkbook: ManagerialWorkbook | null;
  currentWorkbookId: string | null;
  loading: boolean;
  loadSucceeded: boolean;
  localRecoveryComplete: boolean;
  loadError: ManagerialLoadError | null;
  cloudAvailable: boolean;
  storageWarning: string | null;
  saveStatuses: Record<string, ManagerialSaveStatus>;
  saveErrors: Record<string, string>;
  pendingDeletions: string[];
  createWorkbook: (name: string, input?: ManagerialWorkbookInput) => string;
  updateWorkbook: (id: string, updates: ManagerialWorkbookUpdates | ((workbook: ManagerialWorkbook) => ManagerialWorkbookUpdates)) => void;
  renameWorkbook: (id: string, name: string) => void;
  deleteWorkbook: (id: string) => Promise<ManagerialDeleteResult>;
  retry: () => Promise<void>;
}

const blankStore = (): DraftStore => ({ workbooks: [], dirty: {}, tombstones: {}, heads: {}, tokens: {}, deleted: new Set() });
const isObject = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value);

function isWorkbook(value: unknown): value is ManagerialWorkbook {
  if (!isObject(value)) return false;
  return typeof value.id === 'string' && typeof value.name === 'string'
    && typeof value.periodLabel === 'string' && typeof value.notes === 'string'
    && typeof value.createdAt === 'string' && typeof value.updatedAt === 'string'
    && ['openingCash', 'closingCash', 'netIncome'].every(key => value[key] === null || (typeof value[key] === 'number' && Number.isFinite(value[key])))
    && ['directOperating', 'indirectAdjustments', 'investing', 'financing', 'noncash'].every(key => Array.isArray(value[key]) && value[key].every((row: unknown) => isObject(row) && typeof row.id === 'string' && typeof row.title === 'string' && (row.amount === null || (typeof row.amount === 'number' && Number.isFinite(row.amount) && row.amount >= 0)) && (key === 'noncash' || (key === 'indirectAdjustments' ? row.direction === 'add' || row.direction === 'deduct' : row.direction === 'inflow' || row.direction === 'outflow'))));
}

function revisions(value: unknown): value is Record<string, number> {
  return isObject(value) && Object.values(value).every(item => typeof item === 'number' && Number.isSafeInteger(item) && item > 0);
}

function isRecoveryEvent(value: unknown): value is RecoveryEvent {
  return isObject(value) && value.version === 2 && typeof value.id === 'string' && typeof value.workbookId === 'string'
    && Array.isArray(value.parents) && value.parents.every(parent => typeof parent === 'string')
    && (value.kind === 'edit' ? isWorkbook(value.workbook) : value.kind === 'delete' || ((value.kind === 'saved' || value.kind === 'deleted') && typeof value.target === 'string'));
}

function projectEvents(events: Map<string, RecoveryEvent>): DraftStore {
  const result = blankStore();
  const superseded = new Set([...events.values()].flatMap(event => event.parents));
  const acknowledged = new Set([...events.values()].filter(event => event.kind === 'saved' || event.kind === 'deleted').map(event => `${event.workbookId}:${event.target}`));
  const acknowledgedOriginal = new Map<string, string>();
  for (const event of events.values()) {
    if (event.kind !== 'saved' || !event.target) continue;
    const target = events.get(event.target);
    if (target?.workbookId === event.workbookId) {
      const previous = acknowledgedOriginal.get(event.workbookId);
      if (!previous || event.target.localeCompare(previous) < 0) acknowledgedOriginal.set(event.workbookId, event.target);
    }
  }
  const groups = new Map<string, RecoveryEvent[]>();
  for (const event of events.values()) {
    if (event.kind === 'delete') result.deleted.add(event.workbookId);
    if ((event.kind !== 'edit' && event.kind !== 'delete') || superseded.has(event.id)) continue;
    const group = groups.get(event.workbookId) ?? [];
    group.push(event);
    groups.set(event.workbookId, group);
  }
  for (const [id, group] of groups) {
    const edits = group.filter(event => event.kind === 'edit').sort((a, b) => {
      const preferred = acknowledgedOriginal.get(id);
      if (a.id === preferred) return -1;
      if (b.id === preferred) return 1;
      return a.id.localeCompare(b.id);
    });
    const deletions = group.filter(event => event.kind === 'delete');
    result.heads[id] = group.map(event => event.id);
    if (deletions.length) {
      const pending = deletions.find(event => !acknowledged.has(`${id}:${event.id}`));
      if (pending) { result.tombstones[id] = 1; result.tokens[id] = pending.id; }
    }
    edits.forEach((event, index) => {
      const recovered = result.deleted.has(id) || index > 0;
      const displayId = recovered ? event.id : id;
      const workbook = { ...event.workbook!, id: displayId, ...(recovered ? { name: `${event.workbook!.name} (recovered tab conflict)` } : {}) };
      result.workbooks.push(workbook);
      result.heads[displayId] = [event.id];
      result.tokens[displayId] = event.id;
      if (!acknowledged.has(`${displayId}:${event.id}`)) result.dirty[displayId] = 1;
    });
  }
  return result;
}

function recover(key: string, prefix: string): { store: DraftStore; events: Map<string, RecoveryEvent>; warning: string | null; complete: boolean } {
  const events = new Map<string, RecoveryEvent>();
  let complete = true;
  let warning: string | null = null;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw) {
      let data: unknown;
      try { data = JSON.parse(raw); } catch { data = null; }
      if (!isObject(data) || data.version !== 1 || !Array.isArray(data.workbooks) || !data.workbooks.every(isWorkbook) || !revisions(data.dirty) || !revisions(data.tombstones)) {
        complete = false;
        warning = 'Some local recovery data could not be read. Original drafts are preserved; keep this page open until cloud saving succeeds.';
      } else {
        for (const workbook of data.workbooks as ManagerialWorkbook[]) {
          const event: RecoveryEvent = { version: 2, id: `legacy-${workbook.id}`, workbookId: workbook.id, parents: [], kind: 'edit', workbook };
          events.set(event.id, event);
          if (!data.dirty[workbook.id]) events.set(`legacy-saved-${workbook.id}`, { version: 2, id: `legacy-saved-${workbook.id}`, workbookId: workbook.id, parents: [], kind: 'saved', target: event.id });
        }
        for (const id of Object.keys(data.tombstones)) events.set(`legacy-delete-${id}`, { version: 2, id: `legacy-delete-${id}`, workbookId: id, parents: [`legacy-${id}`], kind: 'delete' });
      }
    }
    for (let index = 0; index < window.localStorage.length; index++) {
      const eventKey = window.localStorage.key(index);
      if (!eventKey?.startsWith(prefix)) continue;
      let event: unknown;
      try { event = JSON.parse(window.localStorage.getItem(eventKey)!); } catch { event = null; }
      if (isRecoveryEvent(event)) events.set(event.id, event);
      else { complete = false; warning = 'Some local recovery data could not be read. Original drafts are preserved; keep this page open until cloud saving succeeds.'; }
    }
  } catch {
    complete = false;
    warning = 'Browser storage is unavailable or recovery data is unreadable. Keep this page open until cloud saving succeeds.';
  }
  return { store: projectEvents(events), events, warning, complete };
}

function errorInfo(error: unknown): ManagerialLoadError {
  const detail = isObject(error) ? String(error.message ?? 'Request failed') : error instanceof Error ? error.message : String(error);
  const code = isObject(error) ? error.code : null;
  const missing = code === '42P01' || code === 'PGRST205' || /managerial_workbooks.*(does not exist|schema cache)|could not find.*managerial_workbooks/i.test(detail);
  return { kind: missing ? 'missing-table' : 'network', message: missing ? 'Pending setup: managerial cloud storage is not installed. Work is saved on this device only. Run supabase/managerial_workbooks.sql, then Retry.' : `Cloud request failed: ${detail}. Your local changes are retained. Retry when connected.` };
}

export function useManagerial(userId: string, active: boolean, workbookId: string | null): ManagerialContextType {
  const storageKey = `classic-ledger:managerial:v1:${userId}`;
  const recoveryPrefix = `classic-ledger:managerial:v2:${userId}:event:`;
  const [initial] = useState(() => recover(storageKey, recoveryPrefix));
  const store = useRef(initial.store);
  const events = useRef(initial.events);
  const unpersisted = useRef(new Set<string>());
  const changed = useRef<Record<string, number>>({});
  const sequence = useRef(0);
  const [workbooks, setWorkbooks] = useState(initial.store.workbooks.filter(w => !initial.store.tombstones[w.id]));
  const [storageWarning, setStorageWarning] = useState(initial.warning);
  const [loading, setLoading] = useState(false);
  const [loadSucceeded, setLoadSucceeded] = useState(false);
  const [loadError, setLoadError] = useState<ManagerialLoadError | null>(null);
  const [cloudAvailable, setCloudAvailable] = useState(false);
  const [saveStatuses, setSaveStatuses] = useState<Record<string, ManagerialSaveStatus>>(() => Object.fromEntries([
    ...initial.store.workbooks.map(w => [w.id, initial.store.dirty[w.id] ? 'pending' : 'saved']),
    ...Object.keys(initial.store.tombstones).map(id => [id, 'pending-deletion']),
  ]));
  const [saveErrors, setSaveErrors] = useState<Record<string, string>>({});
  const [pendingDeletions, setPendingDeletions] = useState(Object.keys(initial.store.tombstones));
  const [epoch, setEpoch] = useState(0);
  const cloud = useRef(false);
  const failures = useRef(new Set<string>());
  const alive = useRef(true);
  const attemptedLoad = useRef(false);
  const loadFlight = useRef<Promise<void> | null>(null);
  const saveFlight = useRef<Promise<void> | null>(null);

  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);

  const reproject = useCallback(() => {
    const projected = projectEvents(events.current);
    for (const id of store.current.deleted) projected.deleted.add(id);
    const cloudOnly = store.current.workbooks.filter(workbook => !store.current.heads[workbook.id] && !projected.heads[workbook.id] && !projected.deleted.has(workbook.id));
    projected.workbooks.push(...cloudOnly);
    store.current = projected;
  }, []);

  const persist = useCallback(() => {
    try {
      for (const id of unpersisted.current) {
        window.localStorage.setItem(`${recoveryPrefix}${id}`, JSON.stringify(events.current.get(id)));
        unpersisted.current.delete(id);
      }
      if (alive.current) setStorageWarning(initial.warning);
    } catch {
      if (alive.current) setStorageWarning('Browser storage is unavailable or full. Keep this page open; changes may be lost on reload until cloud saving succeeds.');
    }
  }, [initial.warning, recoveryPrefix]);

  const record = useCallback((event: Omit<RecoveryEvent, 'id' | 'version'>) => {
    const entry: RecoveryEvent = { ...event, id: crypto.randomUUID(), version: 2 };
    events.current.set(entry.id, entry);
    unpersisted.current.add(entry.id);
    changed.current[event.workbookId] = ++sequence.current;
    reproject();
    return entry.id;
  }, [reproject]);

  const publish = useCallback(() => {
    persist();
    if (!alive.current) return;
    setWorkbooks(store.current.workbooks.filter(w => !store.current.tombstones[w.id]));
    setPendingDeletions(Object.keys(store.current.tombstones));
    setEpoch(value => value + 1);
  }, [persist]);

  const setStatus = useCallback((id: string, status: ManagerialSaveStatus, error?: string) => {
    if (!alive.current) return;
    setSaveStatuses(prev => ({ ...prev, [id]: status }));
    setSaveErrors(prev => {
      const next = { ...prev };
      if (error) next[id] = error;
      else delete next[id];
      return next;
    });
  }, []);

  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (!event.key?.startsWith(recoveryPrefix) || !event.newValue) return;
      try {
        const entry: unknown = JSON.parse(event.newValue);
        if (!isRecoveryEvent(entry)) { setStorageWarning('A recovery entry is unreadable; original drafts are preserved.'); return; }
        if (events.current.has(entry.id)) return;
        events.current.set(entry.id, entry);
        changed.current[entry.workbookId] = ++sequence.current;
        reproject();
        failures.current.delete(entry.workbookId);
        setSaveStatuses(Object.fromEntries([
          ...store.current.workbooks.map(workbook => [workbook.id, store.current.dirty[workbook.id] ? 'pending' : 'saved']),
          ...Object.keys(store.current.tombstones).map(id => [id, 'pending-deletion']),
        ]));
        publish();
      } catch { setStorageWarning('A recovery entry is unreadable; original drafts are preserved.'); }
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [publish, recoveryPrefix, reproject]);

  const flush = useCallback((): Promise<void> => {
    if (saveFlight.current) return saveFlight.current;
    if (!cloud.current) return Promise.resolve();
    const run = async () => {
      const ids = new Set([...Object.keys(store.current.dirty), ...Object.keys(store.current.tombstones)]);
      for (const id of ids) {
        if (failures.current.has(id) || !cloud.current) continue;
        const deletion = store.current.tombstones[id];
        const revision = store.current.tokens[id];
        const workbook = store.current.workbooks.find(w => w.id === id);
        if (!revision || (!deletion && !workbook)) continue;
        setStatus(id, deletion ? 'pending-deletion' : 'saving');
        const controller = new AbortController();
        const timer = window.setTimeout(() => controller.abort(), 15000);
        try {
          const request = deletion
            ? supabase.from('managerial_workbooks').delete().eq('id', id).eq('user_id', userId).select('id').abortSignal(controller.signal)
            : supabase.from('managerial_workbooks').upsert({ id, user_id: userId, name: workbook!.name, data: workbook!, created_at: workbook!.createdAt, updated_at: workbook!.updatedAt }, { onConflict: 'id' }).select('id').abortSignal(controller.signal);
          const { data, error } = await request;
          if (!alive.current) return;
          if (error) throw error;
          if (!deletion && !data?.some(row => row.id === id)) throw new Error('The cloud did not confirm this save');
          record({ workbookId: id, parents: [], kind: deletion ? 'deleted' : 'saved', target: revision });
          setStatus(id, store.current.tombstones[id] ? 'pending-deletion' : store.current.dirty[id] ? 'pending' : 'saved');
          publish();
        } catch (error) {
          if (!alive.current) return;
          const info = errorInfo(error);
          const currentRevision = store.current.tokens[id];
          if (currentRevision === revision) {
            failures.current.add(id);
            setStatus(id, deletion ? 'pending-deletion' : 'error', info.message);
          } else {
            setStatus(id, store.current.tombstones[id] ? 'pending-deletion' : store.current.dirty[id] ? 'pending' : 'saved');
          }
          if (info.kind === 'missing-table') {
            cloud.current = false;
            if (alive.current) { setCloudAvailable(false); setLoadError(info); setLoadSucceeded(false); }
          }
          persist();
        } finally {
          window.clearTimeout(timer);
        }
      }
    };
    const promise = run().finally(() => {
      saveFlight.current = null;
      if (alive.current) setEpoch(value => value + 1);
    });
    saveFlight.current = promise;
    return promise;
  }, [persist, publish, record, setStatus, userId]);

  const load = useCallback((): Promise<void> => {
    if (loadFlight.current) return loadFlight.current;
    attemptedLoad.current = true;
    setLoading(true);
    setLoadError(null);
    const startedAt = sequence.current;
    const run = async () => {
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 15000);
      try {
        const { data, error } = await supabase.from('managerial_workbooks').select('id, name, data, created_at, updated_at').eq('user_id', userId).order('updated_at', { ascending: false }).abortSignal(controller.signal);
        if (!alive.current) return;
        if (error) throw error;
        const loaded: ManagerialWorkbook[] = (data ?? []).map(row => ({ ...(isObject(row.data) ? row.data : {}), id: row.id, name: row.name, createdAt: row.created_at, updatedAt: row.updated_at } as ManagerialWorkbook));
        if (!loaded.every(isWorkbook)) {
          if (alive.current) setLoadError({ kind: 'data', message: 'Some cloud workbook data is invalid. Local drafts are retained. Retry after repairing the cloud record.' });
          cloud.current = false;
          if (alive.current) { setCloudAvailable(false); setLoadSucceeded(false); }
          return;
        }
        const local = store.current.workbooks;
        const loadedIds = new Set(loaded.map(workbook => workbook.id));
        for (const workbook of local) {
          if (!loadedIds.has(workbook.id) && !store.current.dirty[workbook.id] && !store.current.tombstones[workbook.id] && (changed.current[workbook.id] ?? 0) <= startedAt && store.current.heads[workbook.id]?.length) {
            record({ workbookId: workbook.id, parents: store.current.heads[workbook.id], kind: 'delete' });
            record({ workbookId: workbook.id, parents: [], kind: 'deleted', target: store.current.tokens[workbook.id] });
          }
        }
        const preserve = (id: string) => !!store.current.dirty[id] || (changed.current[id] ?? 0) > startedAt;
        const merged = loaded.filter(w => !preserve(w.id) && !store.current.deleted.has(w.id));
        merged.push(...store.current.workbooks.filter(w => preserve(w.id) && !store.current.deleted.has(w.id) && !store.current.tombstones[w.id]));
        for (const workbook of loaded) {
          if (!store.current.heads[workbook.id] || preserve(workbook.id) || store.current.deleted.has(workbook.id)) continue;
          const head = store.current.tokens[workbook.id];
          if (head && JSON.stringify(events.current.get(head)?.workbook) !== JSON.stringify(workbook)) {
            const target = record({ workbookId: workbook.id, parents: store.current.heads[workbook.id], kind: 'edit', workbook });
            record({ workbookId: workbook.id, parents: [], kind: 'saved', target });
          }
        }
        store.current.workbooks = merged;
        cloud.current = true;
        failures.current.clear();
        if (alive.current) {
          setCloudAvailable(true);
          setLoadSucceeded(true);
          setSaveStatuses(Object.fromEntries(merged.map(w => [w.id, store.current.dirty[w.id] ? 'pending' : 'saved'])));
          setSaveErrors({});
        }
        publish();
      } catch (error) {
        cloud.current = false;
        if (alive.current) { setCloudAvailable(false); setLoadSucceeded(false); setLoadError(errorInfo(error)); }
      } finally {
        window.clearTimeout(timer);
        if (alive.current) setLoading(false);
      }
    };
    const promise = run().finally(() => { loadFlight.current = null; });
    loadFlight.current = promise;
    return promise;
  }, [publish, record, userId]);

  useEffect(() => {
    if (active && !attemptedLoad.current) void load();
  }, [active, load]);

  useEffect(() => {
    if (!cloudAvailable || loading || saveFlight.current) return;
    const candidates = [...Object.keys(store.current.dirty), ...Object.keys(store.current.tombstones)].some(id => !failures.current.has(id));
    if (!candidates) return;
    const timer = window.setTimeout(() => { void flush(); }, 800);
    return () => window.clearTimeout(timer);
  }, [cloudAvailable, loading, epoch, flush]);

  const createWorkbook = useCallback((name: string, input: ManagerialWorkbookInput = {}): string => {
    const workbook = createBlankManagerialWorkbook(name, input);
    if (!isWorkbook(workbook)) throw new Error('Workbook amounts must be finite; row amounts must be nonnegative.');
    record({ workbookId: workbook.id, parents: [], kind: 'edit', workbook });
    setStatus(workbook.id, 'pending');
    publish();
    return workbook.id;
  }, [publish, record, setStatus]);

  const updateWorkbook = useCallback((id: string, updates: ManagerialWorkbookUpdates | ((workbook: ManagerialWorkbook) => ManagerialWorkbookUpdates)) => {
    if (store.current.tombstones[id]) return;
    const current = store.current.workbooks.find(w => w.id === id);
    if (!current) return;
    const patch = typeof updates === 'function' ? updates(structuredClone(current)) : updates;
    const next = { ...current, ...patch, id: current.id, createdAt: current.createdAt, updatedAt: new Date().toISOString() };
    if (!isWorkbook(next)) throw new Error('Workbook amounts must be finite; row amounts must be nonnegative.');
    record({ workbookId: id, parents: store.current.heads[id] ?? [], kind: 'edit', workbook: next });
    failures.current.delete(id);
    setStatus(id, 'pending');
    publish();
  }, [publish, record, setStatus]);

  const renameWorkbook = useCallback((id: string, name: string) => {
    if (!name.trim()) return;
    updateWorkbook(id, { name: name.trim() });
  }, [updateWorkbook]);

  const deleteWorkbook = useCallback(async (id: string): Promise<ManagerialDeleteResult> => {
    if (!store.current.workbooks.some(w => w.id === id) && !store.current.tombstones[id]) return { deleted: true, pending: false };
    record({ workbookId: id, parents: store.current.heads[id] ?? [], kind: 'delete' });
    failures.current.delete(id);
    setStatus(id, 'pending-deletion');
    publish();
    if (cloud.current) {
      await flush();
      if (store.current.tombstones[id] && !failures.current.has(id)) await flush();
    }
    const pending = !!store.current.tombstones[id];
    return { deleted: !pending, pending, ...(pending ? { error: 'Deletion is pending cloud confirmation. This device will not restore the deleted workbook; use Retry to finish syncing.' } : {}) };
  }, [flush, publish, record, setStatus]);

  const retry = useCallback(async () => {
    await saveFlight.current;
    await load();
    if (cloud.current) await flush();
  }, [flush, load]);

  return {
    workbooks, currentWorkbook: workbooks.find(w => w.id === workbookId) ?? null, currentWorkbookId: workbookId,
    loading: loading || (active && !attemptedLoad.current), loadSucceeded, localRecoveryComplete: initial.complete,
    loadError, cloudAvailable, storageWarning, saveStatuses, saveErrors, pendingDeletions,
    createWorkbook, updateWorkbook, renameWorkbook, deleteWorkbook, retry,
  };
}
