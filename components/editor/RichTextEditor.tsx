"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import { useEffect } from 'react';

export default function RichTextEditor({ content, onChange }: { content: string, onChange: (content: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown, 
    ],
    content: content,
    immediatelyRender: false, // <--- THIS FIXES THE SSR ERROR
    editorProps: {
      attributes: {
        class: 'w-full h-full min-h-[800px] focus:outline-none text-slate-800 text-[17px] leading-relaxed [&_h1]:text-4xl [&_h1]:font-extrabold [&_h1]:mb-6 [&_h1]:mt-8 [&_h1]:tracking-tight [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-4 [&_h2]:mt-8 [&_h2]:border-b [&_h2]:border-slate-100 [&_h2]:pb-2 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mb-3 [&_h3]:mt-6 [&_p]:mb-5 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-5 [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-5 [&_ol]:space-y-2 [&_strong]:font-bold [&_blockquote]:border-l-4 [&_blockquote]:border-indigo-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:bg-slate-50 [&_blockquote]:py-1',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.storage.markdown.getMarkdown());
    },
  });

  useEffect(() => {
    if (editor && content) {
      const currentContent = editor.storage.markdown.getMarkdown();
      if (content !== currentContent) {
        editor.commands.setContent(content);
      }
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className="w-full">
      <EditorContent editor={editor} />
    </div>
  );
}