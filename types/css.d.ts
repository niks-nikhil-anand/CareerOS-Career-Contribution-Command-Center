import "react";

// Allow CSS custom properties (e.g. `--accent`) in inline `style` objects.
// CareerOS components scope per-module accents this way.
declare module "react" {
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined;
  }
}
