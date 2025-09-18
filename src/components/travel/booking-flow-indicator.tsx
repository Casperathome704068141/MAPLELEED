"use client";

import {Check} from "lucide-react";
import {cn} from "@/lib/utils";

const FLOW_STEPS = [
  {
    title: "Booking",
    description: "Choose your MapleLeed itinerary.",
  },
  {
    title: "Details",
    description: "Enter traveller and contact details.",
  },
  {
    title: "Checkout",
    description: "Confirm issuance and get documents.",
  },
] as const;

type BookingFlowIndicatorProps = {
  currentStep: number;
  className?: string;
};

export function BookingFlowIndicator({currentStep, className}: BookingFlowIndicatorProps) {
  return (
    <ol className={cn("grid gap-4 md:grid-cols-3", className)}>
      {FLOW_STEPS.map((step, index) => {
        const stepNumber = index + 1;
        const isComplete = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;

        return (
          <li
            key={step.title}
            className={cn(
              "rounded-2xl border border-border bg-card/80 p-4 shadow-sm transition",
              isCurrent && "border-primary shadow-md",
              isComplete && !isCurrent && "border-primary/60",
            )}
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold",
                  (isCurrent || isComplete)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground",
                )}
                aria-hidden="true"
              >
                {isComplete ? <Check className="h-4 w-4" /> : stepNumber}
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{step.title}</p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

