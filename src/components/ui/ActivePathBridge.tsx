"use client";

import { useEffect } from "react";
import { useSettings } from "../layout/SettingsContext";

interface ActivePathBridgeProps {
  segment: string;
}

export function ActivePathBridge({ segment }: ActivePathBridgeProps) {
  const { setActivePathSegment } = useSettings();

  useEffect(() => {
    setActivePathSegment(segment);
  }, [segment, setActivePathSegment]);

  return null;
}
