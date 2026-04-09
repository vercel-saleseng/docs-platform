// Admin page: lives on the root domain at localhost:3000/admin.
// Tenant selector in the header, split-pane markdown editor with live preview.
// Cache invalidation controls at three levels: doc → tenant → global.
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  invalidateDoc,
  invalidateTenant,
  invalidateAll,
} from "@/app/actions";
import { TENANTS } from "@/lib/tenants";

type DocEntry = { slug: string; title: string };
type InvalidationResult = { level: string; tag: string; at: string };

const tenantList = Object.values(TENANTS);

// Minimal markdown → HTML for the preview pane
function renderPreview(md: string): string {
  let html = md
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang, code) => {
      const escaped = code.replace(/</g, "&lt;").replace(/>/g, "&gt;").trimEnd();
      return `<pre class="preview-code"><code data-lang="${lang}">${escaped}</code></pre>`;
    })
    .replace(/^### (.+)$/gm, '<h3 class="preview-h3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="preview-h2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="preview-h1">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, '<code class="preview-inline-code">$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="preview-link">$1</a>')
    .replace(
      /\{\{(\w+(?:\.\w+)*)\}\}/g,
      '<span class="preview-var">{{$1}}</span>'
    )
    .replace(/^\|(.+)\|$/gm, (row) => {
      const cells = row.split("|").filter(Boolean).map((c) => c.trim());
      if (cells.every((c) => /^[-:]+$/.test(c))) return "<!--sep-->";
      return cells.map((c) => `<td class="preview-td">${c}</td>`).join("");
    });

  html = html.replace(
    /((<td[^>]*>.*<\/td>\n?)+)/g,
    (rows) =>
      `<table class="preview-table"><tbody>${rows
        .split("\n")
        .filter((r) => r.trim() && r !== "<!--sep-->")
        .map((r) => `<tr>${r}</tr>`)
        .join("")}</tbody></table>`
  );
  html = html.replace(/<!--sep-->\n?/g, "");

  html = html
    .split("\n\n")
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (/^<(h[1-3]|pre|table|ul|ol)/.test(trimmed)) return trimmed;
      return `<p class="preview-p">${trimmed.replace(/\n/g, "<br/>")}</p>`;
    })
    .join("\n");

  return html;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function AdminPage() {
  const [tenant, setTenant] = useState(tenantList[0].slug);
  const [docs, setDocs] = useState<DocEntry[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [markdown, setMarkdown] = useState("");
  const [savedMarkdown, setSavedMarkdown] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [lastAction, setLastAction] = useState<InvalidationResult | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const hasChanges = markdown !== savedMarkdown;
  const currentTenant = TENANTS[tenant];

  useEffect(() => {
    setEditing(null);
    setMarkdown("");
    setSavedMarkdown("");
    setStatus("idle");
    setLastAction(null);
    fetch(`/api/docs?tenant=${tenant}`)
      .then((r) => r.json())
      .then(setDocs);
  }, [tenant]);

  async function loadDoc(slug: string) {
    const res = await fetch(`/api/docs/${slug}?tenant=${tenant}`);
    const data = await res.json();
    setEditing(slug);
    setMarkdown(data.markdown);
    setSavedMarkdown(data.markdown);
    setStatus("idle");
    setLastAction(null);
  }

  const saveDoc = useCallback(async () => {
    if (!editing || !hasChanges) return;
    setStatus("saving");

    await fetch(`/api/docs/${editing}?tenant=${tenant}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markdown }),
    });

    const result = await invalidateDoc(tenant, editing);

    setSavedMarkdown(markdown);
    setLastAction(result);
    setStatus("saved");
    setTimeout(() => setStatus("idle"), 4000);
  }, [editing, tenant, markdown, hasChanges]);

  async function handleInvalidateTenant() {
    const result = await invalidateTenant(tenant);
    setLastAction(result);
  }

  async function handleInvalidateAll() {
    const result = await invalidateAll();
    setLastAction(result);
  }

  // Cmd+S / Ctrl+S
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        saveDoc();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [saveDoc]);

  function handleTextareaKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      setMarkdown(ta.value.substring(0, start) + "  " + ta.value.substring(end));
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    }
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-5 h-12 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-800">Admin</span>
          <div className="h-4 w-px bg-gray-200" />
          <div className="flex gap-1">
            {tenantList.map((t) => (
              <button
                key={t.slug}
                onClick={() => setTenant(t.slug)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  tenant === t.slug
                    ? "text-white shadow-sm"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
                style={
                  tenant === t.slug
                    ? { backgroundColor: t.primaryColor }
                    : undefined
                }
              >
                {t.logoText}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {lastAction && (
            <span className="text-xs text-green-600 flex items-center gap-1.5 animate-in">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-mono">{lastAction.tag}</span> invalidated at {formatTime(lastAction.at)}
            </span>
          )}
          <a
            href="/"
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← Hub
          </a>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-52 shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
          {/* Doc list */}
          <div className="flex-1 py-4 px-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3 px-2">
              {currentTenant?.name}
            </p>
            <div className="space-y-0.5">
              {docs.map((doc) => (
                <button
                  key={doc.slug}
                  onClick={() => loadDoc(doc.slug)}
                  className={`block w-full text-left px-3 py-2 rounded-md text-[13px] transition-colors ${
                    editing === doc.slug
                      ? "bg-gray-900 text-white font-medium"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  {doc.title}
                </button>
              ))}
            </div>
          </div>

          {/* Cache invalidation controls */}
          <div className="border-t border-gray-200 p-3 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1 mb-1">
              Invalidate Cache
            </p>

            {editing && (
              <button
                onClick={() => invalidateDoc(tenant, editing).then(setLastAction)}
                className="w-full text-left px-2.5 py-2 rounded-md text-[12px] bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors group"
              >
                <div className="font-medium">This page</div>
                <div className="font-mono text-[10px] text-blue-500 mt-0.5 truncate">
                  doc:{tenant}/{editing}
                </div>
              </button>
            )}

            <button
              onClick={handleInvalidateTenant}
              className="w-full text-left px-2.5 py-2 rounded-md text-[12px] bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
            >
              <div className="font-medium">All {currentTenant?.name}</div>
              <div className="font-mono text-[10px] text-amber-500 mt-0.5">
                tenant:{tenant}
              </div>
            </button>

            <button
              onClick={handleInvalidateAll}
              className="w-full text-left px-2.5 py-2 rounded-md text-[12px] bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
            >
              <div className="font-medium">All tenants</div>
              <div className="font-mono text-[10px] text-red-500 mt-0.5">
                global
              </div>
            </button>
          </div>
        </div>

        {/* Editor + Preview */}
        {editing ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Toolbar */}
            <div className="bg-white border-b border-gray-200 px-4 h-11 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-gray-500">
                  {tenant}/{editing}.md
                </span>
                {hasChanges && (
                  <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                    Unsaved changes
                  </span>
                )}
              </div>
              <button
                onClick={saveDoc}
                disabled={!hasChanges || status === "saving"}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                  hasChanges && status !== "saving"
                    ? "bg-gray-900 text-white hover:bg-gray-800 shadow-sm"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {status === "saving" ? "Publishing..." : "Save & Publish"}
                <span className="ml-1.5 text-[10px] opacity-60">⌘S</span>
              </button>
            </div>

            {/* Split pane */}
            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 flex flex-col border-r border-gray-200">
                <div className="bg-gray-50 border-b border-gray-100 px-4 py-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Markdown
                  </span>
                </div>
                <textarea
                  ref={textareaRef}
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  onKeyDown={handleTextareaKeyDown}
                  spellCheck={false}
                  className="flex-1 font-mono text-[13px] leading-6 text-gray-800 bg-white p-4 focus:outline-none resize-none"
                />
              </div>

              <div className="flex-1 flex flex-col bg-white">
                <div className="bg-gray-50 border-b border-gray-100 px-4 py-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Preview
                  </span>
                </div>
                <div
                  className="flex-1 overflow-y-auto p-6 preview-content"
                  dangerouslySetInnerHTML={{ __html: renderPreview(markdown) }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="text-center">
              <div className="text-gray-300 mb-3">
                <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <p className="text-sm text-gray-400">Select a document to edit</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
