import {Check} from "lucide-react";
import {cn} from "@/lib/utils";

const TRAVEL_STEPS = [
  "Search flights",
  "Review itinerary",
  "Passenger details",
  "Confirmation",
];

export type TravelStepIndicatorProps = {
  currentStep: number;
  className?: string;
};

export function TravelStepIndicator({
  currentStep,
  className,
}: TravelStepIndicatorProps) {
  return (
    <ol
      className={cn(
        "flex flex-wrap items-center gap-4 text-sm text-muted-foreground",
        className,
      )}
    >
      {TRAVEL_STEPS.map((label, index) => {
        const stepNumber = index + 1;
        const isComplete = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        return (
          <li
            key={label}
            className="flex items-center gap-3"
          >
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold transition",
                isComplete &&
                  "border-primary bg-primary text-primary-foreground",
                isCurrent && !isComplete &&
                  "border-primary text-primary",
                !isComplete && !isCurrent && "border-border",
              )}
              aria-hidden="true"
            >
              {isComplete ? <Check className="h-4 w-4" /> : stepNumber}
            </span>
            <span className={cn("font-medium", isCurrent && "text-foreground")}>
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
