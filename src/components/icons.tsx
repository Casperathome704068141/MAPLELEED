import { SVGProps } from "react";

export function VisaPilotIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12h20" />
      <path d="M12 2a10 10 0 0 1 10 10" />
      <path d="M12 22a10 10 0 0 0 10-10" />
      <path d="M2 12a10 10 0 0 0 10 10" />
      <path d="M2 12a10 10 0 0 1 10-10" />
      <path d="M12 2L10 6" />
      <path d="M12 22L10 18" />
      <path d="M20 10l-4-2" />
      <path d="M4 10l4-2" />
    </svg>
  );
}
