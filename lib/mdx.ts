// MDX COMPILATION — where personalization meets caching.
//
// Problem: We want {{user.apiKey}} in markdown to render as a dynamic, personalized
// value — but the MDX compilation itself is cached ("use cache" in the doc page).
//
// Solution: Replace {{variables}} with <UserVar /> client components BEFORE compiling.
// The compiled MDX is static HTML with client component "islands" that fetch user
// data at request time. The cache stores the static shell; the islands are dynamic.
//
// Two replacement strategies:
//   Prose:        {{user.apiKey}}  →  <UserVar field="user.apiKey" />  (JSX in MDX)
//   Code blocks:  {{user.apiKey}}  →  __VAR:user.apiKey__  (text token, swapped by <DynamicCode />)
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { UserVar } from "@/app/components/user-var";
import { DynamicCode } from "@/app/components/dynamic-code";

// Inside fenced code blocks, we can't use JSX — replace with a text token
// that <DynamicCode /> will swap for <UserVar /> at render time.
function replaceVariables(markdown: string): string {
  // First, handle variables inside fenced code blocks (```...```)
  const processed = markdown.replace(
    /(```[\s\S]*?```)/g,
    (codeBlock) =>
      codeBlock.replace(
        /\{\{(\w+(?:\.\w+)*)\}\}/g,
        (_match, field) => `__VAR:${field}__`
      )
  );
  // Then, handle variables in prose (outside code blocks)
  return processed.replace(
    /\{\{(\w+(?:\.\w+)*)\}\}/g,
    (_match, field) => `<UserVar field="${field}" />`
  );
}

export async function compileDoc(rawMarkdown: string) {
  const processed = replaceVariables(rawMarkdown);
  const { content } = await compileMDX({
    source: processed,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
      },
    },
    components: {
      UserVar,
      code: DynamicCode,
    },
  });
  return content;
}
