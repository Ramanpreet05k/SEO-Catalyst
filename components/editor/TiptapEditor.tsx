"use client";

// 1. Core Tiptap imports (Updated for newest version)
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus"; 

import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

// 2. Imported formatting icons
import { Bold, Italic, Heading2, Heading3 } from "lucide-react";

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: "Start writing, or click 'Draft AI Outline' to generate a structure...",
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: content,
    editorProps: {
      attributes: {
        class: "prose prose-slate max-w-none prose-headings:font-bold prose-h1:text-4xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-lg prose-p:leading-relaxed prose-a:text-indigo-600 focus:outline-none min-h-[65vh]",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (editor && content !== editor.getHTML()) {
    setTimeout(() => {
       if (content !== editor.getHTML()) {
         editor.commands.setContent(content);
       }
    }, 0);
  }

  return (
    <div className="w-full mt-4 relative">
      <style dangerouslySetInnerHTML={{__html: `
        .is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #cbd5e1;
          pointer-events: none;
          height: 0;
        }
      `}} />
      
      {/* 3. THE FLOATING BUBBLE MENU */}
      {editor && (
        <BubbleMenu 
          editor={editor} 
          className="flex items-center gap-1 bg-slate-900 p-1.5 rounded-xl shadow-xl border border-slate-700"
        >
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
              editor.isActive('bold') ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
              editor.isActive('italic') ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          
          <div className="w-px h-5 bg-slate-700 mx-1" /> {/* Divider */}
          
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
              editor.isActive('heading', { level: 2 }) ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
              editor.isActive('heading', { level: 3 }) ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>
        </BubbleMenu>
      )}

      {/* The main editor */}
      <EditorContent editor={editor} />
    </div>
  );
}