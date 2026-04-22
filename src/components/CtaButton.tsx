import { forwardRef } from "react";
import type { AnchorHTMLAttributes } from "react";

type CtaLocation = "header" | "hero" | "closing" | (string & {});

type CtaButtonProps = {
  location: CtaLocation;
  children: React.ReactNode;
  className?: string;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "target" | "rel">;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

const OPEN_CHAT_EVENT = "nutrigenius:open-chat";

export const CtaButton = forwardRef<HTMLAnchorElement, CtaButtonProps>(
  ({ location, children, className, onClick, ...rest }, ref) => {
    return (
      <a
        ref={ref}
        {...rest}
        href="#"
        data-cta={location}
        className={className}
        onClick={(ev) => {
          ev.preventDefault();

          if (typeof window !== "undefined" && Array.isArray(window.dataLayer)) {
            window.dataLayer.push({
              event: "cta_click",
              cta_location: location,
              cta_destination: "chat_widget",
            });
          }

          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event(OPEN_CHAT_EVENT));
          }

          onClick?.(ev);
        }}
      >
        {children}
      </a>
    );
  }
);

CtaButton.displayName = "CtaButton";
