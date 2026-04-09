// Custom <code> component for MDX that replaces __VAR:field__ tokens
// with <UserVar /> client components inside code blocks.
// This is necessary because JSX components can't be used inside fenced code blocks.
"use client";

import { type ReactNode, Fragment } from "react";
import { UserVar } from "./user-var";

const VAR_PATTERN = /__VAR:(\w+(?:\.\w+)*)__/;

function splitWithVars(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining) {
    const match = VAR_PATTERN.exec(remaining);
    if (!match) {
      parts.push(remaining);
      break;
    }
    if (match.index > 0) {
      parts.push(remaining.slice(0, match.index));
    }
    parts.push(<UserVar key={key++} field={match[1]} />);
    remaining = remaining.slice(match.index + match[0].length);
  }

  return parts;
}

export function DynamicCode({
  children,
  ...props
}: {
  children?: ReactNode;
} & React.ComponentProps<"code">) {
  // Only process string children (code block content)
  if (typeof children === "string" && VAR_PATTERN.test(children)) {
    return <code {...props}>{splitWithVars(children)}</code>;
  }

  return <code {...props}>{children}</code>;
}
