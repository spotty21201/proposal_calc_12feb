"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { calculateProposal } from "@/lib/calcProposal";
import { defaultPricingTables, scopeOptionsByDiscipline } from "@/lib/pricingDefaults";
import type { ProposalInput, ProposalOutput } from "@/types/proposal";

type ProposalState = {
  input: ProposalInput;
  output: ProposalOutput;
  setInput: <K extends keyof ProposalInput>(key: K, value: ProposalInput[K]) => void;
  setVisualization: (key: keyof ProposalInput["visualization"], value: number) => void;
  recalc: () => void;
  reset: () => void;
};

const defaultInput: ProposalInput = {
  projectName: "SMK 1 Medan Renovation and Master Plan",
  clientName: "Yayasan Pendidikan Telkom",
  clientType: "institutional",
  discipline: "planning",
  areaHa: 100,
  areaSqm: 0,
  scope: "full",
  complexityClass: "B",
  visualization: {
    manView: 1,
    birdView: 1,
    animationMin: 3,
  },
  travelTier: 1,
  engagementActivation: true,
};

const initialOutput = calculateProposal(defaultInput, defaultPricingTables);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export const useProposalStore = create<ProposalState>()(
  persist(
    (set, get) => ({
      input: defaultInput,
      output: initialOutput,
      setInput: (key, value) => {
        set((state) => {
          const next = { ...state.input, [key]: value } as ProposalInput;

          if (key === "clientType") {
            const isInstitutional = value === "institutional";
            if (isInstitutional && next.discipline === "planning") {
              next.engagementActivation = true;
            }
          }

          if (key === "discipline") {
            const allowed = scopeOptionsByDiscipline[value as ProposalInput["discipline"]] as readonly ProposalInput["scope"][];
            if (!allowed.includes(next.scope)) {
              next.scope = allowed[0];
            }
            if (value === "planning") {
              next.engagementActivation = true;
            }
          }

          if (key === "areaHa" && Number(value) > 0) {
            next.areaSqm = 0;
          }
          if (key === "areaSqm" && Number(value) > 0) {
            next.areaHa = 0;
          }

          if (key === "areaHa") {
            const numeric = Number(value);
            next.areaHa = Number.isFinite(numeric) ? Math.max(0, Math.round(numeric * 100) / 100) : 0;
          }
          if (key === "areaSqm") {
            const numeric = Number(value);
            next.areaSqm = Number.isFinite(numeric) ? Math.max(0, Math.trunc(numeric)) : 0;
          }

          return { input: next };
        });

        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => get().recalc(), 250);
      },
      setVisualization: (key, value) => {
        set((state) => ({
          input: {
            ...state.input,
            visualization: {
              ...state.input.visualization,
              [key]: Math.max(0, Math.trunc(value)),
            },
          },
        }));

        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => get().recalc(), 250);
      },
      recalc: () => {
        const next = calculateProposal(get().input, defaultPricingTables);
        set({ output: next });
      },
      reset: () => set({ input: defaultInput, output: initialOutput }),
    }),
    {
      name: "proposal-calculator-state",
      version: 3,
      migrate: (persistedState) => {
        const state = (persistedState ?? {}) as Partial<ProposalState> & { input?: Partial<ProposalInput> };
        const mergedInput: ProposalInput = {
          ...defaultInput,
          ...(state.input ?? {}),
          visualization: {
            ...defaultInput.visualization,
            ...(state.input?.visualization ?? {}),
          },
        };

        return {
          ...state,
          input: mergedInput,
          output: calculateProposal(mergedInput, defaultPricingTables),
        } as ProposalState;
      },
      merge: (persistedState, currentState) => {
        const persisted = (persistedState ?? {}) as Partial<ProposalState> & { input?: Partial<ProposalInput> };
        const mergedInput: ProposalInput = {
          ...currentState.input,
          ...(persisted.input ?? {}),
          visualization: {
            ...currentState.input.visualization,
            ...(persisted.input?.visualization ?? {}),
          },
        };

        return {
          ...currentState,
          ...persisted,
          input: mergedInput,
          output: calculateProposal(mergedInput, defaultPricingTables),
        };
      },
    }
  )
);
