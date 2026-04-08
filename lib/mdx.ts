// MDX compilation pipeline:
// 1. Replaces {{variable}} placeholders with <UserVar /> components
// 2. Compiles markdown → MDX via next-mdx-remote
import { compileMDX } from "next-mdx-remote/rsc";
import { UserVar } from "@/app/components/user-var";

// Turn {{user.name}} into <UserVar field="user.name" />
function replaceVariables(markdown: string): string {
  return markdown.replace(
    /\{\{(\w+(?:\.\w+)*)\}\}/g,
    (_match, field) => `<UserVar field="${field}" />`
  );
}

export async function compileDoc(rawMarkdown: string) {
  const processed = replaceVariables(rawMarkdown);
  const { content } = await compileMDX({
    source: processed,
    components: { UserVar },
  });
  return content;
}
