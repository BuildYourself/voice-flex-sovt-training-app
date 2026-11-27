"use client";

import { useCallback, useEffect, useState } from "react";

import { EMPTY_LIBRARY, LIBRARY_CHANGE_EVENT, parseLibrary, readLibrary, saveLibrary, type UserLibrary } from "@/lib/custom-library";
import type { VoiceFlexProduct } from "@/lib/training-product";

/** The person's own routines and exercises for a product, kept fresh when another tab or a sync changes them. */
export function useCustomLibrary(productType: VoiceFlexProduct) {
  const [library, setLibrary] = useState<UserLibrary>(EMPTY_LIBRARY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const load = () => setLibrary(readLibrary(productType));
    load();
    setReady(true);
    const onStorage = (event: StorageEvent) => {
      if (!event.key || event.key === `voiceflex_library_${productType}`) load();
    };
    window.addEventListener(LIBRARY_CHANGE_EVENT, load);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(LIBRARY_CHANGE_EVENT, load);
      window.removeEventListener("storage", onStorage);
    };
  }, [productType]);

  const save = useCallback(
    (next: UserLibrary) => {
      const ok = saveLibrary(productType, next);
      if (ok) setLibrary(parseLibrary(next));
      return ok;
    },
    [productType]
  );

  return { library, ready, save };
}
