import { Extension } from '@tiptap/core';
import { Image } from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableRow } from '@tiptap/extension-table-row';
import type { Editor } from '@tiptap/react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import axios from 'axios';
import {
    AlignCenter,
    AlignJustify,
    AlignLeft,
    AlignRight,
    Bold,
    Code,
    Heading2,
    Heading3,
    Image as ImageIcon,
    Italic,
    Link as LinkIcon,
    List,
    ListOrdered,
    Loader2,
    Pilcrow,
    Quote,
    Redo,
    RemoveFormatting,
    Sigma,
    Table as TableIcon,
    Underline as UnderlineIcon,
    Undo,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type TextAlignment = 'left' | 'center' | 'right' | 'justify';
export type RichTextEditorVariant = 'full' | 'standard' | 'compact';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        textAlign: {
            setTextAlign: (alignment: TextAlignment) => ReturnType;
            unsetTextAlign: () => ReturnType;
        };
    }
}

const TextAlignExtension = Extension.create({
    name: 'textAlign',

    addGlobalAttributes() {
        return [
            {
                types: ['heading', 'paragraph'],
                attributes: {
                    textAlign: {
                        default: null,
                        parseHTML: (element) => {
                            const align = element.style.textAlign;

                            if (
                                align === 'left' ||
                                align === 'center' ||
                                align === 'right' ||
                                align === 'justify'
                            ) {
                                return align;
                            }

                            return null;
                        },
                        renderHTML: (attributes) => {
                            if (!attributes.textAlign) {
                                return {};
                            }

                            return {
                                style: `text-align: ${attributes.textAlign}`,
                            };
                        },
                    },
                },
            },
        ];
    },

    addCommands() {
        return {
            setTextAlign:
                (alignment: TextAlignment) =>
                ({ commands }) => {
                    return ['heading', 'paragraph']
                        .map((type) =>
                            commands.updateAttributes(type, {
                                textAlign: alignment,
                            }),
                        )
                        .some(Boolean);
                },
            unsetTextAlign:
                () =>
                ({ commands }) => {
                    return ['heading', 'paragraph']
                        .map((type) =>
                            commands.resetAttributes(type, 'textAlign'),
                        )
                        .some(Boolean);
                },
        };
    },
});

export interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    variant?: RichTextEditorVariant;
    placeholder?: string;
    className?: string;
    minHeightClassName?: string;
    imageUploadUrl?: string;
    imageUploadExtraData?: Record<string, string | number>;
}

interface EditorToolbarProps {
    editor: Editor;
    variant: RichTextEditorVariant;
    isSourceMode: boolean;
    isUploadingImage: boolean;
    onToggleSourceMode: () => void;
    onTriggerImageUpload: () => void;
}

function EditorToolbar({
    editor,
    variant,
    isSourceMode,
    isUploadingImage,
    onToggleSourceMode,
    onTriggerImageUpload,
}: EditorToolbarProps) {
    const isCompact = variant === 'compact';
    const isFull = variant === 'full';
    const btnSizeClass = isCompact ? 'h-7 w-7 p-0' : 'h-8 px-2';

    const handleSetLink = () => {
        const previousUrl =
            (editor.getAttributes('link').href as string | undefined) ?? '';
        const url = window.prompt(
            'URL del enlace (deja vacío para quitar)',
            previousUrl,
        );

        if (url === null) {
            return;
        }

        const trimmed = url.trim();

        if (trimmed === '') {
            editor.chain().focus().unsetLink().run();

            return;
        }

        editor
            .chain()
            .focus()
            .extendMarkRange('link')
            .setLink({ href: trimmed })
            .run();
    };

    const handleInsertMath = () => {
        const formula = window.prompt(
            'Introduce la fórmula en LaTeX (ej: x^2 + y^2 = z^2)',
        );

        if (formula && formula.trim() !== '') {
            editor
                .chain()
                .focus()
                .insertContent(` [math]${formula.trim()}[/math] `)
                .run();
        }
    };

    const handleClearFormatting = () => {
        editor
            .chain()
            .focus()
            .unsetAllMarks()
            .clearNodes()
            .unsetTextAlign()
            .run();
    };

    return (
        <div
            className={cn(
                'flex flex-wrap items-center gap-0.5 border-b border-neutral-200 bg-neutral-50/80 dark:border-neutral-800 dark:bg-neutral-900/80',
                isCompact ? 'px-2 py-1' : 'gap-1 p-2',
            )}
        >
            {!isCompact && (
                <>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isSourceMode}
                        title="Párrafo normal"
                        onClick={() =>
                            editor.chain().focus().setParagraph().run()
                        }
                        className={cn(
                            btnSizeClass,
                            editor.isActive('paragraph') &&
                                'bg-neutral-200 dark:bg-neutral-800',
                        )}
                    >
                        <Pilcrow className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isSourceMode}
                        title="Título 2"
                        onClick={() =>
                            editor
                                .chain()
                                .focus()
                                .toggleHeading({ level: 2 })
                                .run()
                        }
                        className={cn(
                            btnSizeClass,
                            editor.isActive('heading', { level: 2 }) &&
                                'bg-neutral-200 dark:bg-neutral-800',
                        )}
                    >
                        <Heading2 className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isSourceMode}
                        title="Título 3"
                        onClick={() =>
                            editor
                                .chain()
                                .focus()
                                .toggleHeading({ level: 3 })
                                .run()
                        }
                        className={cn(
                            btnSizeClass,
                            editor.isActive('heading', { level: 3 }) &&
                                'bg-neutral-200 dark:bg-neutral-800',
                        )}
                    >
                        <Heading3 className="h-4 w-4" />
                    </Button>
                    <div className="mx-1 h-5 w-px bg-neutral-300 dark:bg-neutral-700" />
                </>
            )}

            <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isSourceMode}
                title="Negrita"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={cn(
                    btnSizeClass,
                    editor.isActive('bold') &&
                        'bg-neutral-200 dark:bg-neutral-800',
                )}
            >
                <Bold className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isSourceMode}
                title="Cursiva"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={cn(
                    btnSizeClass,
                    editor.isActive('italic') &&
                        'bg-neutral-200 dark:bg-neutral-800',
                )}
            >
                <Italic className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isSourceMode}
                title="Subrayado"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={cn(
                    btnSizeClass,
                    editor.isActive('underline') &&
                        'bg-neutral-200 dark:bg-neutral-800',
                )}
            >
                <UnderlineIcon className="h-4 w-4" />
            </Button>

            {!isCompact && (
                <>
                    <div className="mx-1 h-5 w-px bg-neutral-300 dark:bg-neutral-700" />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isSourceMode}
                        title="Alinear a la izquierda"
                        onClick={() =>
                            editor.chain().focus().setTextAlign('left').run()
                        }
                        className={cn(
                            btnSizeClass,
                            editor.isActive({ textAlign: 'left' }) &&
                                'bg-neutral-200 dark:bg-neutral-800',
                        )}
                    >
                        <AlignLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isSourceMode}
                        title="Centrar"
                        onClick={() =>
                            editor.chain().focus().setTextAlign('center').run()
                        }
                        className={cn(
                            btnSizeClass,
                            editor.isActive({ textAlign: 'center' }) &&
                                'bg-neutral-200 dark:bg-neutral-800',
                        )}
                    >
                        <AlignCenter className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isSourceMode}
                        title="Alinear a la derecha"
                        onClick={() =>
                            editor.chain().focus().setTextAlign('right').run()
                        }
                        className={cn(
                            btnSizeClass,
                            editor.isActive({ textAlign: 'right' }) &&
                                'bg-neutral-200 dark:bg-neutral-800',
                        )}
                    >
                        <AlignRight className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isSourceMode}
                        title="Justificar"
                        onClick={() =>
                            editor.chain().focus().setTextAlign('justify').run()
                        }
                        className={cn(
                            btnSizeClass,
                            editor.isActive({ textAlign: 'justify' }) &&
                                'bg-neutral-200 dark:bg-neutral-800',
                        )}
                    >
                        <AlignJustify className="h-4 w-4" />
                    </Button>
                </>
            )}

            <div className="mx-1 h-5 w-px bg-neutral-300 dark:bg-neutral-700" />
            <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isSourceMode}
                title="Lista con viñetas"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={cn(
                    btnSizeClass,
                    editor.isActive('bulletList') &&
                        'bg-neutral-200 dark:bg-neutral-800',
                )}
            >
                <List className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isSourceMode}
                title="Lista numerada"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={cn(
                    btnSizeClass,
                    editor.isActive('orderedList') &&
                        'bg-neutral-200 dark:bg-neutral-800',
                )}
            >
                <ListOrdered className="h-4 w-4" />
            </Button>

            {!isCompact && (
                <>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isSourceMode}
                        title="Cita"
                        onClick={() =>
                            editor.chain().focus().toggleBlockquote().run()
                        }
                        className={cn(
                            btnSizeClass,
                            editor.isActive('blockquote') &&
                                'bg-neutral-200 dark:bg-neutral-800',
                        )}
                    >
                        <Quote className="h-4 w-4" />
                    </Button>
                    <div className="mx-1 h-5 w-px bg-neutral-300 dark:bg-neutral-700" />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isSourceMode}
                        title="Insertar o editar enlace"
                        onClick={handleSetLink}
                        className={cn(
                            btnSizeClass,
                            editor.isActive('link') &&
                                'bg-neutral-200 dark:bg-neutral-800',
                        )}
                    >
                        <LinkIcon className="h-4 w-4" />
                    </Button>
                </>
            )}

            {isFull && (
                <>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isSourceMode}
                        title="Insertar tabla 3x3"
                        onClick={() =>
                            editor
                                .chain()
                                .focus()
                                .insertTable({
                                    rows: 3,
                                    cols: 3,
                                    withHeaderRow: true,
                                })
                                .run()
                        }
                        className={btnSizeClass}
                    >
                        <TableIcon className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isSourceMode || isUploadingImage}
                        title="Subir e insertar imagen"
                        onClick={onTriggerImageUpload}
                        className={btnSizeClass}
                    >
                        {isUploadingImage ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <ImageIcon className="h-4 w-4" />
                        )}
                    </Button>
                </>
            )}

            {(isFull || isCompact) && (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isSourceMode}
                    title="Insertar Fórmula (LaTeX)"
                    onClick={handleInsertMath}
                    className={btnSizeClass}
                >
                    <Sigma className="h-4 w-4" />
                </Button>
            )}

            <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isSourceMode}
                title="Limpiar formato (útil al pegar desde Word)"
                onClick={handleClearFormatting}
                className={btnSizeClass}
            >
                <RemoveFormatting className="h-4 w-4" />
            </Button>

            <Button
                type="button"
                variant="ghost"
                size="sm"
                title={isSourceMode ? 'Volver al editor visual' : 'Ver/Editar código HTML'}
                onClick={onToggleSourceMode}
                className={cn(
                    btnSizeClass,
                    isSourceMode &&
                        'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
                )}
            >
                <Code className="h-4 w-4" />
            </Button>

            {!isCompact && (
                <>
                    <div className="flex-1" />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isSourceMode || !editor.can().undo()}
                        title="Deshacer"
                        onClick={() => editor.chain().focus().undo().run()}
                        className={btnSizeClass}
                    >
                        <Undo className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isSourceMode || !editor.can().redo()}
                        title="Rehacer"
                        onClick={() => editor.chain().focus().redo().run()}
                        className={btnSizeClass}
                    >
                        <Redo className="h-4 w-4" />
                    </Button>
                </>
            )}
        </div>
    );
}

const DEFAULT_MIN_HEIGHT: Record<RichTextEditorVariant, string> = {
    full: 'min-h-[260px] p-4',
    standard: 'min-h-[150px] p-3.5',
    compact: 'min-h-[56px] px-3 py-2 text-sm',
};

export default function RichTextEditor({
    content,
    onChange,
    variant = 'full',
    placeholder,
    className,
    minHeightClassName,
    imageUploadUrl = '/admin/editor/upload-image',
    imageUploadExtraData,
}: RichTextEditorProps) {
    const [isSourceMode, setIsSourceMode] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const resolvedEditorClass = cn(
        'prose max-w-none focus:outline-none',
        variant === 'compact' ? 'prose-sm' : 'prose-sm',
        DEFAULT_MIN_HEIGHT[variant],
        minHeightClassName,
    );

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3, 4] },
                link: { openOnClick: false },
            }),
            TextAlignExtension,
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
            Image.configure({ allowBase64: true }),
        ],
        content: content || '',
        onUpdate: ({ editor: activeEditor }) => {
            onChange(activeEditor.getHTML());
        },
        editorProps: {
            attributes: {
                class: resolvedEditorClass,
            },
        },
    });

    useEffect(() => {
        if (!editor || isSourceMode) {
            return;
        }

        const nextContent = content || '';

        if (nextContent === '' && editor.isEmpty) {
            return;
        }

        if (nextContent !== editor.getHTML()) {
            editor.commands.setContent(nextContent, { emitUpdate: false });
        }
    }, [content, editor, isSourceMode]);

    const handleToggleSourceMode = () => {
        if (!editor) {
            return;
        }

        if (isSourceMode) {
            editor.commands.setContent(content || '', { emitUpdate: false });
            setIsSourceMode(false);
        } else {
            setIsSourceMode(true);
        }
    };

    const handleImageFileChange = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];
        e.target.value = '';

        if (!file || !editor) {
            return;
        }

        setIsUploadingImage(true);

        try {
            const formData = new FormData();
            formData.append('image', file);

            if (imageUploadExtraData) {
                Object.entries(imageUploadExtraData).forEach(([key, value]) => {
                    formData.append(key, String(value));
                });
            }

            const response = await axios.post<{ url?: string }>(
                imageUploadUrl,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                },
            );

            if (response.data?.url) {
                editor
                    .chain()
                    .focus()
                    .setImage({ src: response.data.url })
                    .run();
            } else {
                toast.error('No se recibió la URL de la imagen subida.');
            }
        } catch {
            toast.error('Error al subir la imagen. Intenta con PNG, JPG o WEBP.');
        } finally {
            setIsUploadingImage(false);
        }
    };

    if (!editor) {
        return null;
    }

    return (
        <div
            className={cn(
                'overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-950',
                className,
            )}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleImageFileChange}
            />

            <EditorToolbar
                editor={editor}
                variant={variant}
                isSourceMode={isSourceMode}
                isUploadingImage={isUploadingImage}
                onToggleSourceMode={handleToggleSourceMode}
                onTriggerImageUpload={() => fileInputRef.current?.click()}
            />

            {isSourceMode ? (
                <textarea
                    value={content}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="<p>Escribe o pega HTML aquí...</p>"
                    className={cn(
                        'w-full resize-y bg-neutral-950 font-mono text-xs text-emerald-300 focus:outline-none',
                        variant === 'compact'
                            ? 'min-h-[72px] p-2.5'
                            : variant === 'standard'
                              ? 'min-h-[150px] p-3.5'
                              : 'min-h-[260px] p-4',
                        minHeightClassName,
                    )}
                />
            ) : (
                <div className="relative">
                    {placeholder && editor.isEmpty && (
                        <div
                            className={cn(
                                'pointer-events-none absolute top-0 left-0 text-sm text-neutral-400 select-none',
                                variant === 'compact' ? 'px-3 py-2' : 'p-3.5',
                            )}
                        >
                            {placeholder}
                        </div>
                    )}
                    <EditorContent editor={editor} />
                </div>
            )}
        </div>
    );
}
