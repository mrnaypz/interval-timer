import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const storageKey = "interval-timer.presets.v1";

export type Preset = {
  id: string;
  sets: number;
  workSec: number;
  restSec: number;
};

type PresetContextValue = {
  presets: Preset[];
  ready: boolean;
  savePreset: (preset: Omit<Preset, "id">) => Promise<Preset>;
  removePreset: (id: string) => Promise<void>;
};

const PresetContext = createContext<PresetContextValue | null>(null);

function isPreset(value: unknown): value is Preset {
  if (!value || typeof value !== "object") {
    return false;
  }
  const preset = value as Preset;
  return (
    typeof preset.id === "string" &&
    typeof preset.sets === "number" &&
    typeof preset.workSec === "number" &&
    typeof preset.restSec === "number"
  );
}

export function PresetProvider({ children }: { children: ReactNode }) {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(storageKey)
      .then((raw) => {
        if (cancelled) {
          return;
        }
        if (!raw) {
          setPresets([]);
          return;
        }
        const parsed: unknown = JSON.parse(raw);
        setPresets(Array.isArray(parsed) ? parsed.filter(isPreset) : []);
      })
      .catch(() => {
        if (!cancelled) {
          setPresets([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(async (next: Preset[]) => {
    setPresets(next);
    await AsyncStorage.setItem(storageKey, JSON.stringify(next));
  }, []);

  const savePreset = useCallback(
    async (preset: Omit<Preset, "id">) => {
      const saved: Preset = { ...preset, id: `${Date.now()}` };
      await persist([saved, ...presets]);
      return saved;
    },
    [persist, presets],
  );

  const removePreset = useCallback(
    async (id: string) => {
      await persist(presets.filter((preset) => preset.id !== id));
    },
    [persist, presets],
  );

  const value = useMemo(
    () => ({ presets, ready, savePreset, removePreset }),
    [presets, ready, savePreset, removePreset],
  );

  return <PresetContext.Provider value={value}>{children}</PresetContext.Provider>;
}

export function usePresets() {
  const value = useContext(PresetContext);
  if (!value) {
    throw new Error("usePresets must be used inside PresetProvider");
  }
  return value;
}
