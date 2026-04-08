// Admin page: list all docs, edit raw markdown, publish with cache revalidation.
// Demonstrates updateTag() for read-your-writes after content updates.
"use client";

import { useState, useEffect } from "react";
import { revalidateDoc } from "@/app/actions";

type DocEntry = { slug: string; title: string };
const TENANTS = ["acme", "globex", "initech"];

export default function AdminPage() {
  const [docs, setDocs] = useState<Record<string, DocEntry[]>>({});
  const [editing, setEditing] = useState<{ tenant: string; slug: string } | null>(null);
  const [markdown, setMarkdown] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    Promise.all(
      TENANTS.map(async (t) => {
        const res = await fetch(`/api/docs?tenant=${t}`);
        const list: DocEntry[] = await res.json();
        return [t, list] as const;
      })
    ).then((results) => {
      setDocs(Object.fromEntries(results));
    });
  }, []);

  async function loadDoc(tenant: string, slug: string) {
    const res = await fetch(`/api/docs/${slug}?tenant=${tenant}`);
    const data = await res.json();
    setEditing({ tenant, slug });
    setMarkdown(data.markdown);
    setStatus("");
  }

  async function saveDoc() {
    if (!editing) return;
    setStatus("Saving...");

    // 1. Write to Vercel Blob via API
    await fetch(`/api/docs/${editing.slug}?tenant=${editing.tenant}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markdown }),
    });

    // 2. Revalidate cache via Server Action
    const result = await revalidateDoc(editing.tenant, editing.slug);
    setStatus(`Cache revalidated at ${result.revalidatedAt}`);
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">Admin — Content Manager</h1>

      <div className="grid md:grid-cols-[300px_1fr] gap-6">
        {/* Doc list */}
        <div className="space-y-4">
          {TENANTS.map((tenant) => (
            <div key={tenant}>
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">
                {tenant}
              </h2>
              <div className="space-y-1">
                {(docs[tenant] ?? []).map((doc) => (
                  <button
                    key={doc.slug}
                    onClick={() => loadDoc(tenant, doc.slug)}
                    className={`block w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                      editing?.tenant === tenant && editing?.slug === doc.slug
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {doc.title}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Editor */}
        <div>
          {editing ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">
                  {editing.tenant}/{editing.slug}
                </h2>
                <button
                  onClick={saveDoc}
                  className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Save & Publish
                </button>
              </div>
              <textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                className="w-full h-96 font-mono text-sm border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {status && (
                <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded">
                  {status}
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">
              Select a doc from the list to edit.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
