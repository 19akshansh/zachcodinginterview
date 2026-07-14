"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type BreadcrumbLabels = Record<string, string>;

interface BreadcrumbLabelsContextValue {
  labels: BreadcrumbLabels;
  setLabel: (segment: string, label: string) => void;
}

const BreadcrumbLabelsContext =
  createContext<BreadcrumbLabelsContextValue | null>(null);

export const BreadcrumbLabelsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [labels, setLabels] = useState<BreadcrumbLabels>({});

  const setLabel = useCallback((segment: string, label: string) => {
    setLabels((prev) =>
      prev[segment] === label ? prev : { ...prev, [segment]: label },
    );
  }, []);

  return (
    <BreadcrumbLabelsContext.Provider value={{ labels, setLabel }}>
      {children}
    </BreadcrumbLabelsContext.Provider>
  );
};

export const useBreadcrumbLabels = () => {
  const ctx = useContext(BreadcrumbLabelsContext);
  if (!ctx) {
    throw new Error(
      "useBreadcrumbLabels must be used within a BreadcrumbLabelsProvider",
    );
  }
  return ctx;
};

export const useBreadcrumbLabel = (
  segment: string | undefined,
  label: string | undefined | null,
) => {
  const { setLabel } = useBreadcrumbLabels();

  useEffect(() => {
    if (segment && label) {
      setLabel(segment, label);
    }
  }, [segment, label, setLabel]);
};
