import type { ReactNode } from "react";

type MobileScreenProps = {
  children: ReactNode;
};

/**
 * Phone-sized canvas for every screen.
 * On a desktop browser it sits in a device frame.
 * On a phone, or inside a mobile WebView, it fills the screen.
 */
export function MobileScreen({ children }: MobileScreenProps) {
  return (
    <div className="mobile-stage">
      <div className="mobile-device">{children}</div>
    </div>
  );
}
