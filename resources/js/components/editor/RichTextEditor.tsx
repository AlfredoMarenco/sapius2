import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { Image } from '@tiptap/extension-image'
import { 
    Bold, 
    Italic, 
    List, 
    ListOrdered, 
    Quote, 
    Undo, 
    Redo, 
    Link as LinkIcon,
    Table as TableIcon,
    Image as ImageIcon,
    Underline as UnderlineIcon,
    Code,
    Sigma
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    className?: string;
}

export default function RichTextEditor({ content, onChange, className }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Link.configure({ openOnClick: false }),
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
            Image,
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none min-h-[300px] p-4',
            },
        },
    });

    if (!editor) return null;

    const MenuBar = () => {
        return (
            <div className="flex flex-wrap gap-1 p-2 border-b bg-gray-50/50">
                <Button 
                    type="button" variant="ghost" size="sm" 
                    onClick={() => editor.chain().focus().toggleBold().run()} 
                    className={cn(editor.isActive('bold') && "bg-gray-200")}
                >
                    <Bold className="h-4 w-4" />
                </Button>
                <Button 
                    type="button" variant="ghost" size="sm" 
                    onClick={() => editor.chain().focus().toggleItalic().run()} 
                    className={cn(editor.isActive('italic') && "bg-gray-200")}
                >
                    <Italic className="h-4 w-4" />
                </Button>
                <Button 
                    type="button" variant="ghost" size="sm" 
                    onClick={() => editor.chain().focus().toggleUnderline().run()} 
                    className={cn(editor.isActive('underline') && "bg-gray-200")}
                >
                    <UnderlineIcon className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-gray-300 mx-1" />
                <Button 
                    type="button" variant="ghost" size="sm" 
                    onClick={() => editor.chain().focus().toggleBulletList().run()} 
                    className={cn(editor.isActive('bulletList') && "bg-gray-200")}
                >
                    <List className="h-4 w-4" />
                </Button>
                <Button 
                    type="button" variant="ghost" size="sm" 
                    onClick={() => editor.chain().focus().toggleOrderedList().run()} 
                    className={cn(editor.isActive('orderedList') && "bg-gray-200")}
                >
                    <ListOrdered className="h-4 w-4" />
                </Button>
                <Button 
                    type="button" variant="ghost" size="sm" 
                    onClick={() => editor.chain().focus().toggleBlockquote().run()} 
                    className={cn(editor.isActive('blockquote') && "bg-gray-200")}
                >
                    <Quote className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-gray-300 mx-1" />
                <Button 
                    type="button" variant="ghost" size="sm" 
                    onClick={() => {
                        const url = window.prompt('URL');
                        if (url) editor.chain().focus().setLink({ href: url }).run();
                    }} 
                    className={cn(editor.isActive('link') && "bg-gray-200")}
                >
                    <LinkIcon className="h-4 w-4" />
                </Button>
                <Button 
                    type="button" variant="ghost" size="sm" 
                    onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                >
                    <TableIcon className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-gray-300 mx-1" />
                <Button 
                    type="button" variant="ghost" size="sm" 
                    title="Insertar Fórmula (LaTeX)"
                    onClick={() => {
                        const formula = window.prompt('Introduce la fórmula en LaTeX (ej: x^2 + y^2 = z^2)');
                        if (formula) {
                            editor.chain().focus().insertContent(` [math]${formula}[/math] `).run();
                        }
                    }}
                >
                    <Sigma className="h-4 w-4" />
                </Button>
                <div className="flex-1" />
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().undo().run()}><Undo className="h-4 w-4" /></Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => editor.chain().focus().redo().run()}><Redo className="h-4 w-4" /></Button>
            </div>
        );
    };

    return (
        <div className={cn("border rounded-2xl overflow-hidden bg-white shadow-sm", className)}>
            <MenuBar />
            <EditorContent editor={editor} />
        </div>
    );
}

// Add global styles for tables in the editor
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.innerHTML = `
        .ProseMirror table {
            border-collapse: collapse;
            table-layout: fixed;
            width: 100%;
            margin: 0;
            overflow: hidden;
        }
        .ProseMirror td, .ProseMirror th {
            min-width: 1em;
            border: 1px solid #ced4da;
            padding: 3px 5px;
            vertical-align: top;
            box-sizing: border-box;
            position: relative;
        }
        .ProseMirror th {
            font-weight: bold;
            text-align: left;
            background-color: #f8f9fa;
        }
    `;
    document.head.appendChild(style);
}
