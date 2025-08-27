// src/global.d.ts
import React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "lord-icon": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        src?: string;
        trigger?: string;
        state?: string;
        colors?: string;
        style?: React.CSSProperties;
        [key: string]: any;
      };
    }
  }
}
