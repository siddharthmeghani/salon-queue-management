import { createClient } from '@supabase/supabase-js';
import { initialState } from '../data/seed';

const STORAGE_KEY = 'aura-salon-state-v1';
const EVENT_NAME = 'aura-salon-state-change';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const supabaseEnabled = Boolean(supabaseUrl && supabaseKey);
const supabase = supabaseEnabled ? createClient(supabaseUrl, supabaseKey) : null;

let currentState = structuredClone(initialState);
let ready = false;
let channel = null;
let initPromise = null;
const listeners = new Set();

function notify() {
  listeners.forEach((listener) => listener());
}

function setCurrentState(next, persistLocal = false) {
  currentState = next;
  if (!supabaseEnabled && persistLocal) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
    window.dispatchEvent(new CustomEvent(EVENT_NAME));
  }
  notify();
}

export function getState() {
  return currentState;
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function initializeStore() {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    if (supabaseEnabled) {
      const { data, error } = await supabase.from('salon_state').select('state').eq('id', 'main').maybeSingle();
      if (error) console.error('Could not load Supabase state:', error.message);
      if (data?.state) {
        setCurrentState(data.state);
      } else if (!error) {
        const { error: insertError } = await supabase.from('salon_state').upsert({ id: 'main', state: initialState });
        if (insertError) console.error('Could not seed Supabase state:', insertError.message);
        setCurrentState(structuredClone(initialState));
      }
      channel = supabase.channel('salon-state-live').on('postgres_changes', { event: '*', schema: 'public', table: 'salon_state', filter: 'id=eq.main' }, (payload) => {
        if (payload.new?.state) setCurrentState(payload.new.state);
      }).subscribe((status) => {
        if (status === 'CHANNEL_ERROR') console.error('Supabase realtime connection failed.');
      });
    } else {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) currentState = JSON.parse(saved);
        else localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
      } catch (error) {
        console.warn('Local demo state could not be read; using sample data.', error);
      }
      window.addEventListener('storage', (event) => {
        if (event.key === STORAGE_KEY && event.newValue) {
          try { setCurrentState(JSON.parse(event.newValue)); } catch { /* ignore malformed local data */ }
        }
      });
      window.addEventListener(EVENT_NAME, () => notify());
    }
    ready = true;
    notify();
    return currentState;
  })();
  return initPromise;
}

export function isStoreReady() {
  return ready;
}

export function updateState(mutator) {
  const draft = structuredClone(currentState);
  const result = mutator(draft);
  setCurrentState(draft, !supabaseEnabled);
  if (supabaseEnabled) {
    supabase.from('salon_state').upsert({ id: 'main', state: draft }).then(({ error }) => {
      if (error) console.error('Could not save salon state:', error.message);
    });
  }
  return result;
}

export async function resetDemoState() {
  const next = structuredClone(initialState);
  setCurrentState(next, !supabaseEnabled);
  if (supabaseEnabled) {
    const { error } = await supabase.from('salon_state').upsert({ id: 'main', state: next });
    if (error) throw error;
  }
}

export function stopStore() {
  if (channel && supabase) supabase.removeChannel(channel);
}
