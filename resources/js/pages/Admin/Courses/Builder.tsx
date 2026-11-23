import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Plus,
    BookOpen,
    FileText,
    HelpCircle,
    ChevronRight,
    Layout,
    ArrowLeft,
    Save,
    Trash2,
    Settings,
    Eye,
    CheckCircle2,
    Video,
    Image as ImageIcon,
    Link as LinkIcon,
    File as FileIcon,
    Play,
    Pencil,
    X,
    AlertCircle,
    CheckCircle,
    ShieldAlert,
    Clock,
    Download,
    UploadCloud,
} from 'lucide-react';
import type { ReactElement } from 'react';
import { useState, useMemo, useEffect } from 'react';
import RichTextEditor from '@/components/editor/RichTextEditor';
import MathHtml from '@/components/MathHtml';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import {
    cn,
    getEmbedVideoUrl,
    isEmptyRichHtml,
    normalizeOptionalRichHtml,
} from '@/lib/utils';
import ContentSchedulingModal from './Partials/ContentSchedulingModal';

interface Answer {
    id?: number;
    text: string;
    is_correct: boolean;
    image?: string | null;
    imagen?: string | null;
}

interface Question {
    id: number;
    slug?: string | null;
    text: string;
    explanation: string | null;
    points: number | string;
    image?: string | null;
    imagen?: string | null;
    answers: Answer[];
}

interface Quiz {
    id: number;
    title: string;
    description?: string | null;
    descripcion?: string | null;
    type: string;
    time_limit: string | number | null;
    attempts_allowed: number;
    passing_score: number;
    tiempo_caducidad?: string | null;
    tiempo_vigencia?: string | null;
    is_scheduled: boolean;
    available_at: string | null;
    expires_at: string | null;
    questions: Question[];
}

interface Homework {
    id?: number;
    title: string;
    description: string;
    points: number;
}

interface Media {
    id: number;
    title: string;
    file_type: string;
    file_path: string;
    is_downloadable: boolean;
    tipo?: string;
    ruta?: string;
    url?: string;
}

interface Lesson {
    id: number;
    title: string;
    content: string | null;
    summary?: string | null;
    is_active: boolean;
    is_scheduled: boolean;
    available_at: string | null;
    expires_at: string | null;
    media: Media[];
    quizzes: Quiz[];
    homeworkAssignments?: Homework[];
    homework_assignments?: Homework[];
}

interface Module {
    id: number;
    title: string;
    image: string | null;
    is_active: boolean;
    is_scheduled: boolean;
    available_at: string | null;
    expires_at: string | null;
    lessons: Lesson[];
}

interface Course {
    id: number;
    title: string;
    modules: Module[];
}

interface Props {
    course: Course;
    routePrefix?: string;
}

function normalizeRoutePrefix(rawPrefix?: string): string {
    const fallback =
        typeof window !== 'undefined' &&
        window.location.pathname.startsWith('/instructor')
            ? '/instructor'
            : '/admin';
    const raw = (rawPrefix || fallback).trim();
    const withLeading = raw.startsWith('/') ? raw : `/${raw}`;

    return withLeading.replace(/\/+$/, '') || '/admin';
}

function timeLimitToMinutes(val: string | number | null | undefined): number {
    if (val === null || val === undefined || val === '') {
return 30;
}

    if (typeof val === 'number') {
return Number.isFinite(val) ? val : 30;
}

    const trimmed = String(val).trim();

    if (/^\d+$/.test(trimmed)) {
return parseInt(trimmed, 10);
}

    const parts = trimmed.split(':').map((p) => parseInt(p, 10));

    if (parts.length >= 2 && !parts.some((n) => Number.isNaN(n))) {
        return parts[0] * 60 + parts[1];
    }

    return 30;
}

function minutesToTimeString(minutes: number): string {
    const safeMins = Math.max(0, Math.floor(Number.isFinite(minutes) ? minutes : 0));
    const h = Math.floor(safeMins / 60);
    const m = safeMins % 60;

    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
}

const Toast = ({
    message,
    type,
    onClose,
}: {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
}) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
                'fixed right-8 bottom-8 z-[100] flex items-center gap-3 rounded-[2rem] border-2 px-6 py-4 shadow-2xl backdrop-blur-md',
                type === 'success'
                    ? 'border-emerald-200 bg-emerald-50/90 text-emerald-800'
                    : 'bg-coral-50/90 border-brand-coral/20 text-brand-coral',
            )}
        >
            {type === 'success' ? (
                <CheckCircle className="h-5 w-5" />
            ) : (
                <AlertCircle className="h-5 w-5" />
            )}
            <span className="text-[10px] font-black tracking-widest uppercase">
                {message}
            </span>
            <button onClick={onClose} className="ml-4 hover:opacity-50">
                <X className="h-4 w-4" />
            </button>
        </motion.div>
    );
};

const QUIZ_TYPES = [
    'EXANI I',
    'EXANI II',
    'EGEL',
    'ENARM',
    'ENQ',
    'PRÁCTICA',
    'EXAMEN',
];

const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB

export default function Builder({ course, routePrefix }: Props) {
    const { props } = usePage();
    const flash = props.flash as { success?: string | null; error?: string | null } | undefined;
    const flashSuccess = flash?.success ?? null;
    const flashError = flash?.error ?? null;
    const prefix = normalizeRoutePrefix(routePrefix);

    const [selectedItem, setSelectedItem] = useState<{
        type: 'course' | 'module' | 'lesson';
        id: number | null;
    }>({ type: 'course', id: course.id });

    const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
    const [isEditModuleModalOpen, setIsEditModuleModalOpen] = useState(false);
    const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
    const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
    const [activeModuleId, setActiveModuleId] = useState<number | null>(null);
    const [editingModule, setEditingModule] = useState<Module | null>(null);
    const [isEditingLessonTitle, setIsEditingLessonTitle] = useState(false);
    const [toast, setToast] = useState<{
        message: string;
        type: 'success' | 'error';
    } | null>(null);

    // Chunk upload state
    const [chunkUploading, setChunkUploading] = useState(false);
    const [chunkProgress, setChunkProgress] = useState(0);

    // Question Create/Edit State
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [questionSaving, setQuestionSaving] = useState(false);
    const [questionImageFile, setQuestionImageFile] = useState<File | null>(null);
    const [questionImagePreview, setQuestionImagePreview] = useState<string | null>(null);
    const [answerImageFiles, setAnswerImageFiles] = useState<Record<number, File | null>>({});
    const [answerImagePreviews, setAnswerImagePreviews] = useState<Record<number, string | null>>({});
    const [questionFormState, setQuestionFormState] = useState<{
        slug: string;
        text: string;
        explanation: string;
        points: string;
        answers: Answer[];
    }>({
        slug: '',
        text: '',
        explanation: '',
        points: '1',
        answers: [
            { text: '', is_correct: true },
            { text: '', is_correct: false },
            { text: '', is_correct: false },
            { text: '', is_correct: false },
        ],
    });

    // Scheduling State
    const [isSchedulingModalOpen, setIsSchedulingModalOpen] = useState(false);
    const [schedulingTarget, setSchedulingTarget] = useState<any>(null);
    const [schedulingType, setSchedulingType] = useState<
        'Modulo' | 'Lección' | 'Examen'
    >('Modulo');

    // Forms
    const moduleForm = useForm({ title: '', image: '', position: 1 });
    const editModuleForm = useForm({ title: '', image: '' });
    const lessonForm = useForm({ title: '', position: 1 });

    // Deletion states
    const [confirmDelete, setConfirmDelete] = useState<{
        type: 'module' | 'lesson' | 'media' | 'question';
        id: number;
        title?: string;
        hasChildren?: boolean;
        counts?: {
            media: number;
            quizzes: number;
            homework: number;
            lessons: number;
        };
    } | null>(null);

    const [prevFlash, setPrevFlash] = useState<{
        success: string | null;
        error: string | null;
    }>({ success: null, error: null });

    if (flashSuccess !== prevFlash.success || flashError !== prevFlash.error) {
        setPrevFlash({ success: flashSuccess, error: flashError });

        if (flashSuccess) {
            setToast({ message: flashSuccess, type: 'success' });
        } else if (flashError) {
            setToast({ message: flashError, type: 'error' });
        }
    }

    const activeLesson = useMemo(() => {
        if (selectedItem.type !== 'lesson') {
            return null;
        }

        for (const m of course.modules || []) {
            const lesson = m.lessons?.find((l) => l.id === selectedItem.id);

            if (lesson) {
                return lesson;
            }
        }

        return null;
    }, [selectedItem, course]);

    const contentForm = useForm({
        content: activeLesson?.content || '',
    });

    const lessonTitleForm = useForm({
        title: activeLesson?.title || '',
    });

    const quizForm = useForm({
        quiz_id: null as number | null,
        title: 'Evaluación de Lección',
        description: '',
        type: 'PRÁCTICA',
        time_limit: 30,
        attempts_allowed: 1,
        passing_score: 70,
        tiempo_caducidad: '',
        tiempo_vigencia: '',
    });

    const homeworkForm = useForm({
        title: 'Tarea de Refuerzo',
        description: '',
        points: 100,
    });

    const mediaForm = useForm({
        title: '',
        file_type: 'video',
        file_path: '',
        is_downloadable: false,
    });

    const importForm = useForm({
        file: null as File | null,
    });

    const handleSelectLesson = (lesson: Lesson) => {
        setSelectedItem({ type: 'lesson', id: lesson.id });
        contentForm.setData('content', lesson.content || '');
        lessonTitleForm.setData('title', lesson.title || '');
        setIsEditingLessonTitle(false);

        const qz = lesson.quizzes?.[0];
        quizForm.setData({
            quiz_id: qz?.id ?? null,
            title: qz?.title ?? 'Evaluación de Lección',
            description: qz?.description ?? qz?.descripcion ?? '',
            type: qz?.type ?? 'PRÁCTICA',
            time_limit: timeLimitToMinutes(qz?.time_limit),
            attempts_allowed: Number(qz?.attempts_allowed ?? 1),
            passing_score: Number(qz?.passing_score ?? 70),
            tiempo_caducidad: qz?.tiempo_caducidad ? String(qz.tiempo_caducidad) : '',
            tiempo_vigencia: qz?.tiempo_vigencia ? String(qz.tiempo_vigencia) : '',
        });

        const hw =
            lesson.homeworkAssignments?.[0] || lesson.homework_assignments?.[0];
        homeworkForm.setData({
            title: hw?.title ?? 'Tarea de Refuerzo',
            description: lesson.summary || hw?.description || '',
            points: hw?.points ?? 100,
        });
    };

    const handleAddModule = (e: React.FormEvent) => {
        e.preventDefault();
        moduleForm.post(`${prefix}/courses/${course.id}/modules`, {
            onSuccess: () => {
                setIsModuleModalOpen(false);
                moduleForm.reset();
            },
        });
    };

    const handleEditModule = (module: Module) => {
        setEditingModule(module);
        editModuleForm.setData({
            title: module.title,
            image: module.image || '',
        });
        setIsEditModuleModalOpen(true);
    };

    const handleUpdateModule = (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingModule) {
return;
}

        editModuleForm.patch(`${prefix}/modules/${editingModule.id}`, {
            onSuccess: () => {
                setIsEditModuleModalOpen(false);
                editModuleForm.reset();
            },
        });
    };

    const handleDeleteModule = () => {
        if (!confirmDelete) {
return;
}

        router.delete(`${prefix}/modules/${confirmDelete.id}`, {
            onSuccess: () => setConfirmDelete(null),
            onError: (err: Record<string, string>) => {
                if (err.error) {
setToast({ message: err.error, type: 'error' });
}
            },
            preserveScroll: true,
        });
    };

    const handleAddLesson = (e: React.FormEvent) => {
        e.preventDefault();

        if (!activeModuleId) {
return;
}

        lessonForm.post(`${prefix}/modules/${activeModuleId}/lessons`, {
            onSuccess: () => {
                setIsLessonModalOpen(false);
                lessonForm.reset();
            },
        });
    };

    const handleUpdateLessonTitle = (e: React.FormEvent) => {
        e.preventDefault();

        if (!activeLesson) {
return;
}

        lessonTitleForm.patch(`${prefix}/lessons/${activeLesson.id}`, {
            onSuccess: () => setIsEditingLessonTitle(false),
            preserveScroll: true,
        });
    };

    const handleDeleteLesson = () => {
        if (!confirmDelete) {
return;
}

        router.delete(`${prefix}/lessons/${confirmDelete.id}`, {
            onSuccess: () => {
                setConfirmDelete(null);
                setSelectedItem({ type: 'course', id: course.id });
            },
            onError: (err: Record<string, string>) => {
                if (err.error) {
setToast({ message: err.error, type: 'error' });
}
            },
            preserveScroll: true,
        });
    };

    const handleSaveContent = () => {
        if (!activeLesson) {
return;
}

        contentForm.patch(`${prefix}/lessons/${activeLesson.id}`, {
            preserveScroll: true,
        });
    };

    const handleChunkVideoUpload = async (file: File) => {
        if (!file.name.toLowerCase().endsWith('.mp4')) {
            setToast({
                message: 'Solo se permiten archivos de video MP4 para subida fragmentada.',
                type: 'error',
            });

            return;
        }

        setChunkUploading(true);
        setChunkProgress(0);

        const totalChunks = Math.max(1, Math.ceil(file.size / CHUNK_SIZE));
        const identifier = `vid_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

        try {
            for (let index = 0; index < totalChunks; index++) {
                const start = index * CHUNK_SIZE;
                const end = Math.min(file.size, start + CHUNK_SIZE);
                const chunk = file.slice(start, end);

                const formData = new FormData();
                formData.append('file', chunk, file.name);
                formData.append('index', String(index));
                formData.append('total_chunks', String(totalChunks));
                formData.append('identifier', identifier);
                formData.append('filename', file.name);

                const response = await axios.post(`${prefix}/media/upload-chunk`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                const pct = Math.round(((index + 1) / totalChunks) * 100);
                setChunkProgress(pct);

                if (response.data?.completed && response.data?.filename) {
                    mediaForm.setData((prev) => ({
                        ...prev,
                        file_type: 'video',
                        file_path: response.data.filename,
                        title: prev.title || file.name.replace(/\.mp4$/i, ''),
                    }));
                    setToast({
                        message: 'Video MP4 subido correctamente por fragmentos.',
                        type: 'success',
                    });
                }
            }
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { error?: string } } };
            setToast({
                message:
                    axiosErr?.response?.data?.error ||
                    'Error al subir el video por fragmentos.',
                type: 'error',
            });
        } finally {
            setChunkUploading(false);
        }
    };

    const handleAddMedia = (e: React.FormEvent) => {
        e.preventDefault();

        if (!activeLesson) {
return;
}

        mediaForm.post(`${prefix}/lessons/${activeLesson.id}/media`, {
            onSuccess: () => {
                setIsMediaModalOpen(false);
                mediaForm.reset();
                setChunkProgress(0);
            },
            preserveScroll: true,
        });
    };

    const handleDeleteMedia = (id: number) => {
        router.delete(`${prefix}/media/${id}`, { preserveScroll: true });
    };

    const handleSaveQuiz = (e: React.FormEvent) => {
        e.preventDefault();

        if (!activeLesson) {
            return;
        }

        quizForm.transform((data) => ({
            ...data,
            quiz_id: activeQuiz?.id ?? data.quiz_id,
        }));
        quizForm.post(`${prefix}/lessons/${activeLesson.id}/quiz`, {
            preserveScroll: true,
        });
    };

    const openNewQuestionModal = () => {
        setEditingQuestion(null);
        setQuestionImageFile(null);
        setQuestionImagePreview(null);
        setAnswerImageFiles({});
        setAnswerImagePreviews({});
        setQuestionFormState({
            slug: '',
            text: '',
            explanation: '',
            points: '1',
            answers: [
                { text: '', is_correct: true },
                { text: '', is_correct: false },
                { text: '', is_correct: false },
                { text: '', is_correct: false },
            ],
        });
        setIsQuestionModalOpen(true);
    };

    const openEditQuestionModal = (question: Question) => {
        setEditingQuestion(question);
        setQuestionImageFile(null);
        setAnswerImageFiles({});
        const existingImg = question.image || question.imagen || null;
        setQuestionImagePreview(
            existingImg
                ? existingImg.startsWith('http')
                    ? existingImg
                    : `${prefix}/preguntas/imagen/${existingImg}`
                : null,
        );

        const normalizedAnswers: Answer[] =
            question.answers && question.answers.length >= 2
                ? question.answers.map((a) => ({
                      id: a.id,
                      text: a.text,
                      is_correct: Boolean(a.is_correct),
                      image: a.image ?? null,
                      imagen: a.imagen ?? null,
                  }))
                : [
                      { text: '', is_correct: true },
                      { text: '', is_correct: false },
                      { text: '', is_correct: false },
                      { text: '', is_correct: false },
                  ];

        const initialAnswerPreviews: Record<number, string | null> = {};
        normalizedAnswers.forEach((a, idx) => {
            const existingAnsImg = a.image || a.imagen || null;

            if (existingAnsImg) {
                initialAnswerPreviews[idx] = existingAnsImg.startsWith('http')
                    ? existingAnsImg
                    : `${prefix}/preguntas/imagen/${existingAnsImg}`;
            }
        });
        setAnswerImagePreviews(initialAnswerPreviews);

        setQuestionFormState({
            slug: question.slug || '',
            text: question.text || '',
            explanation: question.explanation || '',
            points: String(question.points ?? 1),
            answers: normalizedAnswers,
        });
        setIsQuestionModalOpen(true);
    };

    const handleSaveQuestion = (e: React.FormEvent) => {
        e.preventDefault();

        if (!activeLesson || activeLesson.quizzes.length === 0) {
            return;
        }

        if (isEmptyRichHtml(questionFormState.text)) {
            setToast({
                message: 'El texto de la pregunta es obligatorio.',
                type: 'error',
            });

            return;
        }

        for (let idx = 0; idx < questionFormState.answers.length; idx++) {
            const ans = questionFormState.answers[idx];
            const hasAnsImg = Boolean(
                answerImageFiles[idx] || ans.image || ans.imagen,
            );

            if (isEmptyRichHtml(ans.text) && !hasAnsImg) {
                setToast({
                    message: `La opción ${String.fromCharCode(65 + idx)} debe tener texto o imagen.`,
                    type: 'error',
                });

                return;
            }
        }

        const parsedPoints = parseFloat(questionFormState.points);
        const safePoints = Number.isNaN(parsedPoints) ? 0 : parsedPoints;
        const normalizedExplanation = normalizeOptionalRichHtml(
            questionFormState.explanation,
        );

        setQuestionSaving(true);

        const targetUrl = editingQuestion
            ? `${prefix}/questions/${editingQuestion.id}`
            : `${prefix}/quizzes/${activeLesson.quizzes[0].id}/questions`;

        const hasAnyImageFile =
            Boolean(questionImageFile) ||
            Object.values(answerImageFiles).some(Boolean);

        if (hasAnyImageFile) {
            const formData = new FormData();

            if (editingQuestion) {
                formData.append('_method', 'PATCH');
            }

            formData.append('slug', questionFormState.slug);
            formData.append('text', questionFormState.text);
            formData.append('explanation', normalizedExplanation);
            formData.append('points', String(safePoints));

            if (questionImageFile) {
                formData.append('image', questionImageFile);
            }

            questionFormState.answers.forEach((ans, idx) => {
                if (ans.id) {
                    formData.append(`answers[${idx}][id]`, String(ans.id));
                }

                const resolvedText = isEmptyRichHtml(ans.text)
                    ? '<p></p>'
                    : ans.text;
                formData.append(`answers[${idx}][text]`, resolvedText);
                formData.append(
                    `answers[${idx}][is_correct]`,
                    ans.is_correct ? '1' : '0',
                );

                const ansFile = answerImageFiles[idx];

                if (ansFile) {
                    formData.append(`answers[${idx}][image]`, ansFile);
                }
            });

            router.post(targetUrl, formData, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    setIsQuestionModalOpen(false);
                    setEditingQuestion(null);
                    setQuestionImageFile(null);
                    setQuestionImagePreview(null);
                    setAnswerImageFiles({});
                    setAnswerImagePreviews({});
                },
                onError: () => {
                    setToast({
                        message: 'Revisa los campos de la pregunta.',
                        type: 'error',
                    });
                },
                onFinish: () => setQuestionSaving(false),
            });

            return;
        }

        const payload = {
            slug: questionFormState.slug || null,
            text: questionFormState.text,
            explanation: normalizedExplanation || null,
            points: safePoints,
            answers: questionFormState.answers.map((ans) => ({
                ...(ans.id ? { id: ans.id } : {}),
                text: isEmptyRichHtml(ans.text) ? '<p></p>' : ans.text,
                is_correct: Boolean(ans.is_correct),
            })),
        };

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                setIsQuestionModalOpen(false);
                setEditingQuestion(null);
                setAnswerImageFiles({});
                setAnswerImagePreviews({});
            },
            onError: () => {
                setToast({
                    message: 'Revisa los campos de la pregunta.',
                    type: 'error',
                });
            },
            onFinish: () => setQuestionSaving(false),
        };

        if (editingQuestion) {
            router.patch(targetUrl, payload, options);
        } else {
            router.post(targetUrl, payload, options);
        }
    };

    const handleImportSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!activeLesson || activeLesson.quizzes.length === 0) {
return;
}

        importForm.post(`${prefix}/quizzes/${activeLesson.quizzes[0].id}/import-questions`, {
            onSuccess: () => {
                setIsImportModalOpen(false);
                importForm.reset();
            },
        });
    };

    const handleDeleteQuestion = (id: number) => {
        router.delete(`${prefix}/questions/${id}`, { preserveScroll: true });
    };

    const handleSaveHomework = (e: React.FormEvent) => {
        e.preventDefault();

        if (!activeLesson) {
return;
}

        homeworkForm.post(`${prefix}/lessons/${activeLesson.id}/homework`, {
            preserveScroll: true,
        });
    };

    const handleOpenScheduling = (
        type: 'Modulo' | 'Lección' | 'Examen',
        target: any,
    ) => {
        setSchedulingType(type);
        setSchedulingTarget(target);
        setIsSchedulingModalOpen(true);
    };

    const handleSaveScheduling = (formValues: any) => {
        if (!schedulingTarget) {
return;
}

        if (schedulingType === 'Examen') {
            if (!activeLesson) {
return;
}

            router.post(
                `${prefix}/lessons/${activeLesson.id}/quiz`,
                {
                    ...quizForm.data,
                    quiz_id: activeQuiz?.id ?? quizForm.data.quiz_id,
                    ...formValues,
                },
                {
                    onSuccess: () => {
                        setIsSchedulingModalOpen(false);
                        setToast({
                            message: `${schedulingType} programado correctamente`,
                            type: 'success',
                        });
                    },
                    preserveScroll: true,
                },
            );

            return;
        }

        const url =
            schedulingType === 'Modulo'
                ? `${prefix}/modules/${schedulingTarget.id}`
                : `${prefix}/lessons/${schedulingTarget.id}`;

        router.patch(url, formValues, {
            onSuccess: () => {
                setIsSchedulingModalOpen(false);
                setToast({
                    message: `${schedulingType} programado correctamente`,
                    type: 'success',
                });
            },
            preserveScroll: true,
        });
    };

    const activeQuiz = activeLesson?.quizzes?.[0];

    return (
        <>
            <Head title={`Constructor - ${course.title}`} />

            <AnimatePresence>
                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}
            </AnimatePresence>

            <div className="flex h-[calc(100vh-4rem)] flex-col bg-[#F8FAFC]">
                <header className="flex items-center justify-between border-b bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="rounded-xl border hover:bg-gray-50"
                        >
                            <Link href={`${prefix}/cursos`}>
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-xl font-black tracking-tight text-brand-navy uppercase">
                                {course.title}
                            </h1>
                            <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                                <span>Constructor</span>{' '}
                                <ChevronRight className="h-3 w-3" />
                                <span className="text-brand-blue">Suite Pedagógica</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex flex-1 overflow-hidden">
                    <aside className="flex w-80 flex-col overflow-y-auto border-r bg-white">
                        <div className="flex items-center justify-between border-b bg-gray-50/50 p-4">
                            <span className="text-[10px] font-black tracking-widest text-brand-navy/60 uppercase">
                                Estructura del Curso
                            </span>
                            <Dialog
                                open={isModuleModalOpen}
                                onOpenChange={setIsModuleModalOpen}
                            >
                                <DialogTrigger asChild>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 rounded-full text-brand-blue hover:bg-brand-blue/10"
                                    >
                                        <Plus className="h-5 w-5" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="rounded-[2rem] border-2 shadow-2xl">
                                    <DialogHeader>
                                        <DialogTitle className="font-black tracking-tight uppercase">
                                            Nuevo Módulo
                                        </DialogTitle>
                                    </DialogHeader>
                                    <form
                                        onSubmit={handleAddModule}
                                        className="space-y-4 py-4"
                                    >
                                        <div className="grid gap-2">
                                            <Label className="font-bold">
                                                Título del Módulo
                                            </Label>
                                            <Input
                                                value={moduleForm.data.title}
                                                onChange={(e) =>
                                                    moduleForm.setData('title', e.target.value)
                                                }
                                                placeholder="Ej: Introducción a la Anatomía"
                                                className="h-12 rounded-xl border-2"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label className="font-bold">
                                                Imagen/Icono (URL)
                                            </Label>
                                            <Input
                                                value={moduleForm.data.image}
                                                onChange={(e) =>
                                                    moduleForm.setData('image', e.target.value)
                                                }
                                                placeholder="https://..."
                                                className="h-12 rounded-xl border-2"
                                            />
                                        </div>
                                        <DialogFooter>
                                            <Button
                                                type="submit"
                                                disabled={moduleForm.processing}
                                                className="h-12 rounded-xl bg-brand-blue px-8 font-bold tracking-widest uppercase shadow-lg shadow-brand-blue/20"
                                            >
                                                Crear Módulo
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <div className="p-3">
                            <Accordion type="multiple" className="space-y-2">
                                {course.modules.length === 0 && (
                                    <div className="p-8 text-center text-xs text-muted-foreground italic">
                                        No hay módulos añadidos.
                                    </div>
                                )}
                                {course.modules.map((module) => (
                                    <AccordionItem
                                        key={module.id}
                                        value={`module-${module.id}`}
                                        className="overflow-hidden rounded-2xl border-2 border-brand-navy/5 bg-white shadow-sm transition-shadow hover:shadow-md"
                                    >
                                        <div className="group/module flex w-full items-center pr-4">
                                            <AccordionTrigger className="flex-1 px-5 py-4 hover:bg-gray-50/50 hover:no-underline">
                                                <div className="flex items-center gap-3">
                                                    {module.image ? (
                                                        <img
                                                            src={
                                                                /^(https?:)?\/\//.test(module.image) || module.image.startsWith('/')
                                                                    ? module.image
                                                                    : `/cursos/image/${encodeURIComponent(module.image)}`
                                                            }
                                                            alt={module.title}
                                                            className="h-6 w-6 rounded-md object-cover"
                                                        />
                                                    ) : (
                                                        <Layout className="h-4 w-4 text-brand-navy/40" />
                                                    )}
                                                    <span className="text-xs font-black tracking-widest text-brand-navy uppercase">
                                                        {module.title}
                                                    </span>
                                                </div>
                                            </AccordionTrigger>
                                            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover/module:opacity-100">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className={cn(
                                                        'h-8 w-8',
                                                        module.is_scheduled
                                                            ? 'bg-brand-blue/10 text-brand-blue'
                                                            : 'text-gray-400 hover:bg-brand-blue/10 hover:text-brand-blue',
                                                    )}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOpenScheduling('Modulo', module);
                                                    }}
                                                >
                                                    <Clock className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-brand-blue hover:bg-brand-blue/10"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditModule(module);
                                                    }}
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const lCount =
                                                            module.lessons?.length || 0;
                                                        setConfirmDelete({
                                                            type: 'module',
                                                            id: module.id,
                                                            title: module.title,
                                                            hasChildren: lCount > 0,
                                                            counts: {
                                                                media: 0,
                                                                quizzes: 0,
                                                                homework: 0,
                                                                lessons: lCount,
                                                            },
                                                        });
                                                    }}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                        <AccordionContent className="border-t-2 border-brand-navy/5 bg-gray-50/30 p-0">
                                            <div className="py-2">
                                                {module.lessons.map((lesson) => {
                                                    const mCount = lesson.media?.length || 0;
                                                    const qCount = lesson.quizzes?.length || 0;
                                                    const hCount =
                                                        (lesson.homeworkAssignments?.length ||
                                                            0) +
                                                        (lesson.homework_assignments?.length ||
                                                            0);
                                                    const hasChildren =
                                                        mCount + qCount + hCount > 0;

                                                    return (
                                                        <div
                                                            key={lesson.id}
                                                            className="group/lesson relative"
                                                        >
                                                            <div
                                                                onClick={() => handleSelectLesson(lesson)}
                                                                className={cn(
                                                                    'mx-2 mb-1 flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 pr-12 transition-all',
                                                                    selectedItem.type ===
                                                                        'lesson' &&
                                                                        selectedItem.id ===
                                                                            lesson.id
                                                                        ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20'
                                                                        : 'text-brand-navy/70 hover:bg-brand-blue/10 hover:text-brand-blue',
                                                                )}
                                                            >
                                                                <BookOpen
                                                                    className={cn(
                                                                        'h-4 w-4',
                                                                        selectedItem.type ===
                                                                            'lesson' &&
                                                                            selectedItem.id ===
                                                                                lesson.id
                                                                            ? 'text-white'
                                                                            : 'text-brand-navy/30',
                                                                    )}
                                                                />
                                                                <span className="truncate text-[11px] font-bold tracking-wide uppercase">
                                                                    {lesson.title}
                                                                </span>
                                                            </div>
                                                            <div className="absolute top-1/2 right-4 flex -translate-y-1/2 items-center gap-1 opacity-0 transition-opacity group-hover/lesson:opacity-100">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className={cn(
                                                                        'h-7 w-7 rounded-lg',
                                                                        lesson.is_scheduled
                                                                            ? 'bg-brand-blue/10 text-brand-blue'
                                                                            : 'text-gray-400 hover:bg-brand-blue/10 hover:text-brand-blue',
                                                                    )}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleOpenScheduling(
                                                                            'Lección',
                                                                            lesson,
                                                                        );
                                                                    }}
                                                                >
                                                                    <Clock className="h-3 w-3" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className={cn(
                                                                        'h-7 w-7 rounded-lg',
                                                                        selectedItem.id ===
                                                                            lesson.id
                                                                            ? 'text-white hover:bg-white/20'
                                                                            : 'text-destructive hover:bg-destructive/10',
                                                                    )}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setConfirmDelete({
                                                                            type: 'lesson',
                                                                            id: lesson.id,
                                                                            title: lesson.title,
                                                                            hasChildren,
                                                                            counts: {
                                                                                media: mCount,
                                                                                quizzes: qCount,
                                                                                homework:
                                                                                    hCount,
                                                                                lessons: 0,
                                                                            },
                                                                        });
                                                                    }}
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="mx-2 mt-2 h-10 w-[calc(100%-1rem)] border-2 border-dashed border-brand-blue/20 text-[10px] font-black tracking-widest text-brand-blue uppercase hover:border-brand-blue hover:bg-brand-blue/10"
                                                    onClick={() => {
                                                        setActiveModuleId(module.id);
                                                        setIsLessonModalOpen(true);
                                                    }}
                                                >
                                                    <Plus className="mr-2 h-3 w-3" />
                                                    Nueva Lección
                                                </Button>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    </aside>

                    <main className="flex-1 overflow-y-auto bg-white">
                        {selectedItem.type === 'lesson' && activeLesson ? (
                            <div className="mx-auto max-w-6xl space-y-12 p-8 lg:p-12">
                                <div className="animate-in fade-in slide-in-from-top-4 flex flex-wrap items-center justify-between gap-4 duration-500">
                                    <div className="mr-4 flex-1">
                                        {isEditingLessonTitle ? (
                                            <form
                                                onSubmit={handleUpdateLessonTitle}
                                                className="flex max-w-2xl items-center gap-2"
                                            >
                                                <Input
                                                    autoFocus
                                                    value={lessonTitleForm.data.title}
                                                    onChange={(e) =>
                                                        lessonTitleForm.setData(
                                                            'title',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="h-14 rounded-2xl border-2 border-brand-blue text-3xl font-black tracking-tighter text-brand-navy uppercase ring-offset-0 focus-visible:ring-0"
                                                />
                                                <Button
                                                    type="submit"
                                                    disabled={lessonTitleForm.processing}
                                                    className="h-14 w-14 rounded-2xl bg-brand-blue shadow-lg shadow-brand-blue/20"
                                                >
                                                    <Save className="h-6 w-6" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={() =>
                                                        setIsEditingLessonTitle(false)
                                                    }
                                                    className="h-14 w-14 rounded-2xl text-muted-foreground"
                                                >
                                                    <X className="h-6 w-6" />
                                                </Button>
                                            </form>
                                        ) : (
                                            <div
                                                className="group/title flex cursor-pointer items-center gap-4"
                                                onClick={() =>
                                                    setIsEditingLessonTitle(true)
                                                }
                                            >
                                                <h2 className="text-4xl leading-none font-black tracking-tighter text-brand-navy uppercase">
                                                    {activeLesson.title}
                                                </h2>
                                                <Pencil className="h-5 w-5 text-brand-blue opacity-0 transition-opacity group-hover/title:opacity-100" />
                                            </div>
                                        )}
                                        <div className="mt-4 flex items-center gap-2">
                                            <Badge
                                                variant="outline"
                                                className="rounded-full border-brand-blue px-4 text-[9px] font-black tracking-widest text-brand-blue uppercase"
                                            >
                                                {activeLesson.media?.length ?? 0} Recursos
                                            </Badge>
                                            <Badge
                                                variant="outline"
                                                className="rounded-full border-orange-400 px-4 text-[9px] font-black tracking-widest text-orange-600 uppercase"
                                            >
                                                {activeQuiz?.type ?? 'Sin Examen'}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <Button
                                            variant="outline"
                                            asChild
                                            className="h-12 rounded-2xl border-brand-blue/30 px-5 text-[10px] font-black tracking-widest text-brand-blue uppercase hover:bg-brand-blue/5"
                                        >
                                            <Link
                                                href={`${prefix}/lessons/${activeLesson.id}/material-pdfs`}
                                            >
                                                <FileText className="mr-2 h-4 w-4" />
                                                PDFs Interactivos
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => setIsPreviewModalOpen(true)}
                                            className="h-12 rounded-2xl px-6 text-[10px] font-black tracking-widest uppercase hover:bg-gray-50"
                                        >
                                            <Eye className="mr-2 h-4 w-4" /> Vista Previa
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="h-12 w-12 rounded-2xl text-destructive hover:bg-destructive/5"
                                            onClick={() => {
                                                const mCount = activeLesson.media?.length || 0;
                                                const qCount =
                                                    activeLesson.quizzes?.length || 0;
                                                const hCount =
                                                    (activeLesson.homeworkAssignments
                                                        ?.length || 0) +
                                                    (activeLesson.homework_assignments
                                                        ?.length || 0);
                                                const hasChildren =
                                                    mCount + qCount + hCount > 0;
                                                setConfirmDelete({
                                                    type: 'lesson',
                                                    id: activeLesson.id,
                                                    title: activeLesson.title,
                                                    hasChildren,
                                                    counts: {
                                                        media: mCount,
                                                        quizzes: qCount,
                                                        homework: hCount,
                                                        lessons: 0,
                                                    },
                                                });
                                            }}
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>

                                <Tabs defaultValue="content" className="w-full">
                                    <TabsList className="sticky top-0 z-10 mb-10 h-16 w-fit justify-start gap-2 rounded-[2rem] bg-gray-100/80 p-1.5 px-2 shadow-inner backdrop-blur-sm">
                                        <TabsTrigger
                                            value="content"
                                            className="h-13 rounded-[1.5rem] px-8 text-[10px] font-black tracking-widest uppercase data-[state=active]:bg-white data-[state=active]:text-brand-navy data-[state=active]:shadow-xl"
                                        >
                                            <Layout className="mr-2 h-4 w-4" />
                                            Contenido & Media
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="quiz"
                                            className="h-13 rounded-[1.5rem] px-8 text-[10px] font-black tracking-widest uppercase data-[state=active]:bg-white data-[state=active]:text-brand-navy data-[state=active]:shadow-xl"
                                        >
                                            <HelpCircle className="mr-2 h-4 w-4" />
                                            Examen
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="homework"
                                            className="h-13 rounded-[1.5rem] px-8 text-[10px] font-black tracking-widest uppercase data-[state=active]:bg-white data-[state=active]:text-brand-navy data-[state=active]:shadow-xl"
                                        >
                                            <FileText className="mr-2 h-4 w-4" />
                                            Tarea
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent
                                        value="content"
                                        className="animate-in fade-in slide-in-from-bottom-4 space-y-12 duration-500"
                                    >
                                        {/* Media Manager Section */}
                                        <section className="space-y-6">
                                            <div className="flex flex-wrap items-center justify-between gap-4 px-4">
                                                <div>
                                                    <h3 className="text-xl font-black tracking-tight text-brand-navy uppercase">
                                                        Recursos Multimedia
                                                    </h3>
                                                    <p className="text-xs font-medium text-muted-foreground italic">
                                                        Gestiona videos, imágenes, PDFs y
                                                        documentos de apoyo.
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={() =>
                                                            setIsMediaModalOpen(true)
                                                        }
                                                        className="h-11 rounded-2xl bg-brand-blue px-6 text-[10px] font-black tracking-widest uppercase shadow-lg shadow-brand-blue/20"
                                                    >
                                                        <Plus className="mr-2 h-4 w-4" />{' '}
                                                        Agregar Recurso
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                                {activeLesson.media?.length === 0 && (
                                                    <div className="col-span-full rounded-[2.5rem] border-2 border-dashed bg-gray-50 p-12 text-center">
                                                        <Video className="mx-auto mb-4 h-10 w-10 text-gray-300" />
                                                        <p className="text-xs text-muted-foreground italic">
                                                            Esta lección aún no tiene recursos
                                                            multimedia.
                                                        </p>
                                                    </div>
                                                )}
                                                {activeLesson.media?.map((media) => (
                                                    <Card
                                                        key={media.id}
                                                        className="group overflow-hidden rounded-[2rem] border-2 shadow-lg shadow-brand-navy/5 transition-all hover:border-brand-blue/20"
                                                    >
                                                        <CardContent className="p-0">
                                                            <div
                                                                className={cn(
                                                                    'relative flex aspect-video items-center justify-center bg-gray-100 transition-colors',
                                                                    media.file_type ===
                                                                        'video' &&
                                                                        'cursor-pointer hover:bg-brand-blue/10',
                                                                )}
                                                                onClick={() => {
                                                                    if (
                                                                        media.file_type ===
                                                                        'video'
                                                                    ) {
                                                                        setPreviewVideoUrl(
                                                                            media.file_path,
                                                                        );
                                                                    }
                                                                }}
                                                            >
                                                                {media.file_type === 'video' ? (
                                                                    <div className="flex flex-col items-center gap-2">
                                                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue text-white shadow-lg transition-transform group-hover:scale-110">
                                                                            <Play className="ml-0.5 h-6 w-6 fill-current" />
                                                                        </div>
                                                                        <span className="text-[10px] font-bold text-brand-navy/60">
                                                                            Clic para reproducir
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    <ImageIcon className="h-10 w-10 text-gray-300" />
                                                                )}
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteMedia(
                                                                            media.id,
                                                                        );
                                                                    }}
                                                                    className="absolute top-3 right-3 h-10 w-10 rounded-xl bg-white/80 text-destructive opacity-0 backdrop-blur-sm transition-all group-hover:opacity-100 hover:bg-destructive hover:text-white"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                            <div className="border-t-2 p-4">
                                                                <span className="mb-1 block text-[9px] font-black tracking-widest text-brand-blue uppercase">
                                                                    {media.file_type}
                                                                </span>
                                                                <h4 className="line-clamp-1 text-sm font-bold text-brand-navy">
                                                                    {media.title}
                                                                </h4>
                                                                <p className="mt-1 truncate text-[10px] text-muted-foreground">
                                                                    {media.file_path}
                                                                </p>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        </section>

                                        <Separator className="bg-brand-navy/5" />

                                        {/* Rich Text Editor Section */}
                                        <Card className="overflow-hidden rounded-[3rem] border-2 border-brand-navy/5 shadow-2xl shadow-brand-navy/5">
                                            <CardContent className="space-y-8 p-10">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <Label className="mb-1 flex items-center gap-2 text-xs font-black tracking-widest text-brand-navy uppercase">
                                                            Editor de Contenido Teórico
                                                        </Label>
                                                        <p className="text-[11px] text-muted-foreground italic">
                                                            Redacta el contenido principal en
                                                            formato enriquecido.
                                                        </p>
                                                    </div>
                                                    <Button
                                                        onClick={handleSaveContent}
                                                        disabled={contentForm.processing}
                                                        className="h-12 rounded-2xl bg-brand-navy px-10 font-black tracking-widest uppercase shadow-lg shadow-brand-navy/20"
                                                    >
                                                        Guardar Texto
                                                    </Button>
                                                </div>
                                                <RichTextEditor
                                                    variant="full"
                                                    minHeightClassName="min-h-[420px]"
                                                    content={contentForm.data.content}
                                                    onChange={(val) =>
                                                        contentForm.setData('content', val)
                                                    }
                                                    imageUploadUrl={`${prefix}/editor/upload-image`}
                                                    imageUploadExtraData={{ course_id: course.id }}
                                                    placeholder="Redacta el contenido teórico de la lección..."
                                                />
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    <TabsContent
                                        value="quiz"
                                        className="animate-in fade-in slide-in-from-bottom-4 space-y-8 duration-500"
                                    >
                                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                                            <Card className="h-fit overflow-hidden rounded-[2.5rem] border-2 border-orange-100/50 shadow-xl shadow-orange-100/20 lg:col-span-5">
                                                <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-orange-100 bg-orange-50/50 p-6">
                                                    <CardTitle className="flex items-center gap-2 text-[10px] font-black tracking-widest text-orange-700 uppercase">
                                                        <Settings className="h-4 w-4" />{' '}
                                                        Configuración
                                                    </CardTitle>
                                                    <div className="flex items-center gap-2">
                                                        {activeQuiz && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className={cn(
                                                                    'h-8 w-8',
                                                                    activeQuiz.is_scheduled
                                                                        ? 'bg-orange-100 text-orange-600'
                                                                        : 'text-orange-400 hover:bg-orange-100',
                                                                )}
                                                                onClick={() =>
                                                                    handleOpenScheduling(
                                                                        'Examen',
                                                                        activeQuiz,
                                                                    )
                                                                }
                                                            >
                                                                <Clock className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        <Switch
                                                            checked={
                                                                activeLesson.quizzes.length > 0
                                                            }
                                                        />
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="space-y-4 p-6">
                                                    <div className="grid gap-1.5">
                                                        <Label className="text-[10px] font-black tracking-widest text-orange-800/60 uppercase">
                                                            Categoría Oficial
                                                        </Label>
                                                        <Select
                                                            value={quizForm.data.type}
                                                            onValueChange={(val) =>
                                                                quizForm.setData('type', val)
                                                            }
                                                        >
                                                            <SelectTrigger className="h-11 rounded-xl border-orange-100 bg-white text-sm font-bold">
                                                                <SelectValue placeholder="Seleccionar Tipo" />
                                                            </SelectTrigger>
                                                            <SelectContent className="rounded-2xl border-2">
                                                                {QUIZ_TYPES.map((type) => (
                                                                    <SelectItem
                                                                        key={type}
                                                                        value={type}
                                                                        className="py-3 font-bold"
                                                                    >
                                                                        {type}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="grid gap-1.5">
                                                        <Label className="text-[10px] font-black tracking-widest text-orange-800/60 uppercase">
                                                            Título del Examen
                                                        </Label>
                                                        <Input
                                                            value={quizForm.data.title}
                                                            onChange={(e) =>
                                                                quizForm.setData(
                                                                    'title',
                                                                    e.target.value,
                                                                )
                                                            }
                                                            className="h-11 rounded-xl border-orange-100 font-bold"
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="grid gap-1.5">
                                                            <Label className="text-[10px] font-black tracking-widest text-orange-800/60 uppercase">
                                                                Tiempo (min)
                                                            </Label>
                                                            <Input
                                                                type="number"
                                                                min={0}
                                                                value={quizForm.data.time_limit}
                                                                onChange={(e) =>
                                                                    quizForm.setData(
                                                                        'time_limit',
                                                                        Math.max(
                                                                            0,
                                                                            parseInt(
                                                                                e.target.value ||
                                                                                    '0',
                                                                                10,
                                                                            ),
                                                                        ),
                                                                    )
                                                                }
                                                                className="h-11 rounded-xl border-orange-100 font-bold"
                                                            />
                                                            <span className="text-[10px] text-muted-foreground">
                                                                {minutesToTimeString(
                                                                    quizForm.data.time_limit,
                                                                )}
                                                            </span>
                                                        </div>

                                                        <div className="grid gap-1.5">
                                                            <Label className="text-[10px] font-black tracking-widest text-orange-800/60 uppercase">
                                                                Intentos
                                                            </Label>
                                                            <Input
                                                                type="number"
                                                                min={1}
                                                                value={
                                                                    quizForm.data
                                                                        .attempts_allowed
                                                                }
                                                                onChange={(e) =>
                                                                    quizForm.setData(
                                                                        'attempts_allowed',
                                                                        Math.max(
                                                                            1,
                                                                            parseInt(
                                                                                e.target.value ||
                                                                                    '1',
                                                                                10,
                                                                            ),
                                                                        ),
                                                                    )
                                                                }
                                                                className="h-11 rounded-xl border-orange-100 font-bold"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid gap-1.5">
                                                        <Label className="text-[10px] font-black tracking-widest text-orange-800/60 uppercase">
                                                            Calif. Mínima (%)
                                                        </Label>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            min={0}
                                                            max={100}
                                                            value={quizForm.data.passing_score}
                                                            onChange={(e) =>
                                                                quizForm.setData(
                                                                    'passing_score',
                                                                    parseFloat(
                                                                        e.target.value || '0',
                                                                    ),
                                                                )
                                                            }
                                                            className="h-11 rounded-xl border-orange-100 font-bold"
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="grid gap-1.5">
                                                            <Label className="text-[10px] font-black tracking-widest text-orange-800/60 uppercase">
                                                                Tiempo Caducidad
                                                            </Label>
                                                            <Input
                                                                type="text"
                                                                value={
                                                                    quizForm.data
                                                                        .tiempo_caducidad
                                                                }
                                                                onChange={(e) =>
                                                                    quizForm.setData(
                                                                        'tiempo_caducidad',
                                                                        e.target.value,
                                                                    )
                                                                }
                                                                placeholder="00:00:00"
                                                                className="h-11 rounded-xl border-orange-100 font-bold"
                                                            />
                                                        </div>

                                                        <div className="grid gap-1.5">
                                                            <Label className="text-[10px] font-black tracking-widest text-orange-800/60 uppercase">
                                                                Vigencia Retro
                                                            </Label>
                                                            <Input
                                                                type="text"
                                                                value={
                                                                    quizForm.data
                                                                        .tiempo_vigencia
                                                                }
                                                                onChange={(e) =>
                                                                    quizForm.setData(
                                                                        'tiempo_vigencia',
                                                                        e.target.value,
                                                                    )
                                                                }
                                                                placeholder="00:30:00"
                                                                className="h-11 rounded-xl border-orange-100 font-bold"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid gap-1.5">
                                                        <Label className="text-[10px] font-black tracking-widest text-orange-800/60 uppercase">
                                                            Descripción / Instrucciones
                                                        </Label>
                                                        <RichTextEditor
                                                            variant="standard"
                                                            minHeightClassName="min-h-[120px]"
                                                            content={quizForm.data.description}
                                                            onChange={(val) =>
                                                                quizForm.setData(
                                                                    'description',
                                                                    normalizeOptionalRichHtml(val),
                                                                )
                                                            }
                                                            placeholder="Indicaciones previas para el sustentante..."
                                                        />
                                                    </div>

                                                    <Button
                                                        onClick={handleSaveQuiz}
                                                        disabled={quizForm.processing}
                                                        className="mt-2 h-12 w-full rounded-xl bg-orange-600 text-[10px] font-black tracking-widest uppercase shadow-lg shadow-orange-600/20 hover:bg-orange-700"
                                                    >
                                                        <Save className="mr-2 h-4 w-4" />
                                                        Guardar Ajustes
                                                    </Button>
                                                </CardContent>
                                            </Card>

                                            <div className="space-y-6 lg:col-span-7">
                                                <div className="flex flex-wrap items-center justify-between gap-3 px-4">
                                                    <div>
                                                        <h3 className="text-xl font-black tracking-tight text-brand-navy uppercase">
                                                            Banco de Preguntas (
                                                            {activeQuiz?.questions.length ?? 0})
                                                        </h3>
                                                        <p className="text-xs font-medium text-muted-foreground italic">
                                                            Opción múltiple con soporte de
                                                            puntaje decimal, slug e imagen.
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {activeQuiz && (
                                                            <Button
                                                                asChild
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-11 rounded-2xl border-emerald-600 px-5 text-[10px] font-black tracking-widest text-emerald-700 uppercase hover:bg-emerald-600 hover:text-white"
                                                            >
                                                                <a
                                                                    href={`${prefix}/quizzes/${activeQuiz.id}/export-questions`}
                                                                >
                                                                    <Download className="mr-2 h-3.5 w-3.5" />
                                                                    Exportar
                                                                </a>
                                                            </Button>
                                                        )}
                                                        <Button
                                                            onClick={() =>
                                                                setIsImportModalOpen(true)
                                                            }
                                                            disabled={!activeQuiz}
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-11 rounded-2xl border-brand-navy px-5 text-[10px] font-black tracking-widest text-brand-navy uppercase hover:bg-brand-navy hover:text-white"
                                                        >
                                                            <FileText className="mr-2 h-3.5 w-3.5" />{' '}
                                                            Importar
                                                        </Button>
                                                        <Button
                                                            onClick={openNewQuestionModal}
                                                            disabled={!activeQuiz}
                                                            size="sm"
                                                            className="h-11 rounded-2xl bg-brand-blue px-5 text-[10px] font-black tracking-widest uppercase"
                                                        >
                                                            <Plus className="mr-2 h-3.5 w-3.5" />{' '}
                                                            Nueva Pregunta
                                                        </Button>
                                                    </div>
                                                </div>

                                                {activeQuiz?.questions.length === 0 && (
                                                    <div className="rounded-[3rem] border-2 border-dashed bg-gray-50 p-20 text-center">
                                                        <HelpCircle className="mx-auto mb-4 h-12 w-12 text-gray-200" />
                                                        <p className="text-xs text-muted-foreground italic">
                                                            No has añadido preguntas a este
                                                            examen.
                                                        </p>
                                                    </div>
                                                )}

                                                {activeQuiz?.questions.map((q, idx) => {
                                                    const qImage = q.image || q.imagen;

                                                    return (
                                                        <Card
                                                            key={q.id}
                                                            className="overflow-hidden rounded-[2.5rem] border-2 shadow-xl shadow-brand-navy/5 transition-all hover:border-brand-blue/20"
                                                        >
                                                            <CardContent className="space-y-6 p-8">
                                                                <div className="flex items-start justify-between gap-4">
                                                                    <div className="flex items-start gap-4">
                                                                        <Badge className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-navy text-lg font-black text-white">
                                                                            {idx + 1}
                                                                        </Badge>
                                                                        <div className="space-y-2">
                                                                            <div className="flex flex-wrap items-center gap-2">
                                                                                <Badge
                                                                                    variant="secondary"
                                                                                    className="text-[10px] font-bold"
                                                                                >
                                                                                    {q.points} pts
                                                                                </Badge>
                                                                                {q.slug && (
                                                                                    <Badge
                                                                                        variant="outline"
                                                                                        className="font-mono text-[10px]"
                                                                                    >
                                                                                        {q.slug}
                                                                                    </Badge>
                                                                                )}
                                                                            </div>
                                                                            <MathHtml
                                                                                html={q.text}
                                                                                className="prose prose-sm max-w-none text-base leading-snug font-bold text-brand-navy"
                                                                            />
                                                                            {qImage && (
                                                                                <img
                                                                                    src={
                                                                                        qImage.startsWith(
                                                                                            'http',
                                                                                        )
                                                                                            ? qImage
                                                                                            : `${prefix}/preguntas/imagen/${qImage}`
                                                                                    }
                                                                                    alt={`Imagen pregunta ${idx + 1}`}
                                                                                    className="mt-2 max-h-48 rounded-xl border object-contain"
                                                                                />
                                                                            )}
                                                                            {q.explanation && (
                                                                                <div className="mt-2 rounded-xl border border-amber-200/60 bg-amber-50/70 px-3 py-2 text-xs text-muted-foreground">
                                                                                    <strong className="mb-1 block text-amber-800">
                                                                                        Retroalimentación:
                                                                                    </strong>
                                                                                    <MathHtml
                                                                                        html={q.explanation}
                                                                                        className="prose prose-xs max-w-none"
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex shrink-0 items-center gap-1">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={() =>
                                                                                openEditQuestionModal(
                                                                                    q,
                                                                                )
                                                                            }
                                                                            className="h-10 w-10 rounded-xl text-brand-blue hover:bg-brand-blue/10"
                                                                            title="Editar pregunta"
                                                                        >
                                                                            <Pencil className="h-4 w-4" />
                                                                        </Button>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            onClick={() =>
                                                                                handleDeleteQuestion(
                                                                                    q.id,
                                                                                )
                                                                            }
                                                                            className="h-10 w-10 rounded-xl text-destructive hover:bg-destructive/5"
                                                                            title="Eliminar pregunta"
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-1 gap-3 pl-14 md:grid-cols-2">
                                                                    {q.answers.map((a, aidx) => {
                                                                        const aImage = a.image || a.imagen;

                                                                        return (
                                                                            <div
                                                                                key={a.id ?? aidx}
                                                                                className={cn(
                                                                                    'flex items-start gap-3 rounded-2xl border-2 p-4 text-[11px] font-bold transition-all',
                                                                                    a.is_correct
                                                                                        ? 'border-green-200 bg-green-50 text-green-700 shadow-sm'
                                                                                        : 'border-gray-100 bg-gray-50/50 text-gray-500',
                                                                                )}
                                                                            >
                                                                                {a.is_correct ? (
                                                                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 fill-green-600 text-white" />
                                                                                ) : (
                                                                                    <div className="mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 border-gray-300" />
                                                                                )}
                                                                                <div className="min-w-0 flex-1 space-y-1.5">
                                                                                    <MathHtml
                                                                                        html={a.text}
                                                                                        className="prose prose-xs max-w-none"
                                                                                    />
                                                                                    {aImage && (
                                                                                        <img
                                                                                            src={
                                                                                                aImage.startsWith(
                                                                                                    'http',
                                                                                                )
                                                                                                    ? aImage
                                                                                                    : `${prefix}/preguntas/imagen/${aImage}`
                                                                                            }
                                                                                            alt={`Imagen opción ${String.fromCharCode(65 + aidx)}`}
                                                                                            className="max-h-24 rounded-lg border object-contain"
                                                                                        />
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent
                                        value="homework"
                                        className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                                    >
                                        <Card className="overflow-hidden rounded-[3rem] border-2 border-brand-navy/5 shadow-2xl shadow-brand-navy/5">
                                            <CardContent className="space-y-8 p-10">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="text-xl font-black tracking-tight text-brand-navy uppercase">
                                                            Actividad Práctica / Tarea
                                                        </h3>
                                                        <p className="text-xs font-medium text-muted-foreground italic">
                                                            Define instrucciones para que el
                                                            alumno entregue su trabajo.
                                                        </p>
                                                    </div>
                                                    <Button
                                                        onClick={handleSaveHomework}
                                                        disabled={homeworkForm.processing}
                                                        className="h-12 rounded-2xl bg-brand-blue px-10 font-black tracking-widest uppercase shadow-lg shadow-brand-blue/20"
                                                    >
                                                        Guardar Tarea
                                                    </Button>
                                                </div>
                                                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                                    <div className="grid gap-2">
                                                        <Label className="text-[10px] font-black tracking-widest text-brand-navy uppercase">
                                                            Título
                                                        </Label>
                                                        <Input
                                                            value={homeworkForm.data.title}
                                                            onChange={(e) =>
                                                                homeworkForm.setData(
                                                                    'title',
                                                                    e.target.value,
                                                                )
                                                            }
                                                            className="h-12 rounded-xl border-2 font-bold"
                                                        />
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <Label className="text-[10px] font-black tracking-widest text-brand-navy uppercase">
                                                            Puntos Totales
                                                        </Label>
                                                        <Input
                                                            type="number"
                                                            value={homeworkForm.data.points}
                                                            onChange={(e) =>
                                                                homeworkForm.setData(
                                                                    'points',
                                                                    parseInt(
                                                                        e.target.value || '0',
                                                                        10,
                                                                    ),
                                                                )
                                                            }
                                                            className="h-12 rounded-xl border-2 font-bold"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label className="text-[10px] font-black tracking-widest text-brand-navy uppercase">
                                                        Instrucciones Detalladas
                                                    </Label>
                                                    <RichTextEditor
                                                        variant="standard"
                                                        minHeightClassName="min-h-[220px]"
                                                        content={homeworkForm.data.description}
                                                        onChange={(val) =>
                                                            homeworkForm.setData(
                                                                'description',
                                                                normalizeOptionalRichHtml(val),
                                                            )
                                                        }
                                                        placeholder="Escribe aquí los pasos que el estudiante debe seguir..."
                                                    />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        ) : (
                            <div className="flex h-full items-center justify-center bg-white p-12 text-center">
                                <div className="animate-in zoom-in max-w-md space-y-6 duration-700">
                                    <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-[3rem] bg-brand-blue shadow-2xl shadow-brand-blue/30">
                                        <Layout className="h-14 w-14 text-white" />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-4xl font-black tracking-tighter text-brand-navy uppercase">
                                            Panel de Construcción
                                        </h2>
                                        <p className="font-bold tracking-wide text-muted-foreground italic">
                                            Selecciona una lección del panel lateral para
                                            comenzar a inyectar contenido pedagógico.
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-center gap-4 pt-6 text-[10px] font-black tracking-widest text-brand-navy/30 uppercase">
                                        <span className="flex items-center gap-1">
                                            <Video className="h-3 w-3" /> Multimedia
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <HelpCircle className="h-3 w-3" /> Exámenes
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <FileText className="h-3 w-3" /> Tareas
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Modal New Lesson */}
            <Dialog open={isLessonModalOpen} onOpenChange={setIsLessonModalOpen}>
                <DialogContent className="rounded-[2.5rem] border-2 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="font-black tracking-tight uppercase">
                            Nueva Lección
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddLesson} className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label className="font-bold">Título de la Lección</Label>
                            <Input
                                value={lessonForm.data.title}
                                onChange={(e) =>
                                    lessonForm.setData('title', e.target.value)
                                }
                                placeholder="Ej: Anatomía del cráneo"
                                className="h-12 rounded-xl border-2"
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                type="submit"
                                disabled={lessonForm.processing}
                                className="h-12 rounded-xl bg-brand-blue px-10 font-black tracking-widest uppercase"
                            >
                                Crear Lección
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Modal Edit Module */}
            <Dialog
                open={isEditModuleModalOpen}
                onOpenChange={setIsEditModuleModalOpen}
            >
                <DialogContent className="rounded-[2.5rem] border-2 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="font-black tracking-tight uppercase">
                            Editar Módulo
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateModule} className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label className="font-bold">Título del Módulo</Label>
                            <Input
                                value={editModuleForm.data.title}
                                onChange={(e) =>
                                    editModuleForm.setData('title', e.target.value)
                                }
                                placeholder="Ej: Introducción a la Anatomía"
                                className="h-12 rounded-xl border-2"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="font-bold">Imagen/Icono (URL)</Label>
                            <Input
                                value={editModuleForm.data.image}
                                onChange={(e) =>
                                    editModuleForm.setData('image', e.target.value)
                                }
                                placeholder="https://..."
                                className="h-12 rounded-xl border-2"
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsEditModuleModalOpen(false)}
                                className="h-12 text-[10px] font-black tracking-widest uppercase"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={editModuleForm.processing}
                                className="h-12 rounded-xl bg-brand-blue px-8 font-bold tracking-widest uppercase shadow-lg shadow-brand-blue/20"
                            >
                                Actualizar Módulo
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Confirm Delete Dialog */}
            <Dialog
                open={confirmDelete !== null}
                onOpenChange={(open) => !open && setConfirmDelete(null)}
            >
                <DialogContent className="max-w-md overflow-hidden rounded-[2.5rem] border-2 p-0 shadow-2xl">
                    <div className="space-y-6 p-8 text-center">
                        <div
                            className={cn(
                                'mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded-3xl',
                                confirmDelete?.hasChildren
                                    ? 'bg-brand-blue/10 text-brand-blue'
                                    : 'bg-brand-coral/10 text-brand-coral',
                            )}
                        >
                            {confirmDelete?.hasChildren ? (
                                <ShieldAlert className="h-10 w-10" />
                            ) : (
                                <Trash2 className="h-10 w-10" />
                            )}
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-2xl font-black tracking-tight text-brand-navy uppercase">
                                {confirmDelete?.hasChildren
                                    ? 'Contenido Protegido'
                                    : '¿Deseas Eliminarlo?'}
                            </h3>
                            <div className="px-4 text-sm leading-relaxed font-medium text-muted-foreground">
                                {confirmDelete?.hasChildren ? (
                                    <div className="space-y-4">
                                        <p>
                                            No se puede eliminar{' '}
                                            <span className="font-bold text-brand-navy">
                                                "{confirmDelete.title}"
                                            </span>{' '}
                                            para proteger el progreso.
                                        </p>
                                        <div className="grid gap-2 rounded-2xl border border-brand-blue/10 bg-brand-blue/5 p-4">
                                            <p className="mb-1 text-[9px] font-black tracking-widest text-brand-blue/60 uppercase">
                                                Elementos que impiden el borrado:
                                            </p>
                                            {confirmDelete.counts && (
                                                <div className="flex flex-wrap justify-center gap-2">
                                                    {confirmDelete.counts.media > 0 && (
                                                        <Badge
                                                            variant="outline"
                                                            className="border-brand-blue/20 bg-white"
                                                        >
                                                            {confirmDelete.counts.media}{' '}
                                                            Recurso(s) Media
                                                        </Badge>
                                                    )}
                                                    {confirmDelete.counts.quizzes > 0 && (
                                                        <Badge
                                                            variant="outline"
                                                            className="border-brand-blue/20 bg-white"
                                                        >
                                                            {confirmDelete.counts.quizzes}{' '}
                                                            Examen(es)
                                                        </Badge>
                                                    )}
                                                    {confirmDelete.counts.homework > 0 && (
                                                        <Badge
                                                            variant="outline"
                                                            className="border-brand-blue/20 bg-white"
                                                        >
                                                            {confirmDelete.counts.homework}{' '}
                                                            Tarea(s)
                                                        </Badge>
                                                    )}
                                                    {confirmDelete.counts.lessons > 0 && (
                                                        <Badge
                                                            variant="outline"
                                                            className="border-brand-blue/20 bg-white"
                                                        >
                                                            {confirmDelete.counts.lessons}{' '}
                                                            Lección(es)
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs italic">
                                            Asegúrate de remover estos elementos antes de
                                            eliminar el contenedor.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        Estás por eliminar{' '}
                                        <span className="font-bold text-brand-navy">
                                            "{confirmDelete?.title}"
                                        </span>
                                        . Esta acción es definitiva y no podrá recuperarse en
                                        el futuro.
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-2 px-4 pb-4">
                            {confirmDelete?.hasChildren ? (
                                <Button
                                    onClick={() => setConfirmDelete(null)}
                                    className="h-14 w-full rounded-2xl bg-brand-navy text-[10px] font-black tracking-widest uppercase hover:bg-brand-navy/90"
                                >
                                    Entendido, lo revisaré
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        onClick={
                                            confirmDelete?.type === 'module'
                                                ? handleDeleteModule
                                                : handleDeleteLesson
                                        }
                                        className="h-14 w-full rounded-2xl bg-brand-coral text-[10px] font-black tracking-widest uppercase shadow-lg shadow-brand-coral/20 hover:bg-red-600"
                                    >
                                        Sí, borrar permanentemente
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => setConfirmDelete(null)}
                                        className="h-12 w-full text-[10px] font-black tracking-widest text-muted-foreground uppercase"
                                    >
                                        No, mantenerlo por ahora
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal for Media Resource (with chunked MP4 upload) */}
            <Dialog open={isMediaModalOpen} onOpenChange={setIsMediaModalOpen}>
                <DialogContent className="max-w-lg rounded-[2.5rem] border-2 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 font-black tracking-tight uppercase">
                            <Video className="h-6 w-6 text-brand-blue" />
                            Agregar Recurso Multimedia
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddMedia} className="space-y-5 py-4">
                        <div className="grid gap-2">
                            <Label className="font-bold">Título del Recurso</Label>
                            <Input
                                value={mediaForm.data.title}
                                onChange={(e) =>
                                    mediaForm.setData('title', e.target.value)
                                }
                                placeholder="Ej: Video de Bienvenida"
                                className="h-12 rounded-xl border-2"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="font-bold">Tipo de Recurso</Label>
                            <Select
                                value={mediaForm.data.file_type}
                                onValueChange={(val) =>
                                    mediaForm.setData('file_type', val)
                                }
                            >
                                <SelectTrigger className="h-12 rounded-xl border-2 bg-white font-bold">
                                    <SelectValue placeholder="Seleccionar Tipo" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-2">
                                    <SelectItem value="video" className="py-3 font-bold">
                                        <div className="flex items-center gap-2">
                                            <Video className="h-4 w-4" /> Video (MP4 o
                                            YouTube/Vimeo)
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="image" className="py-3 font-bold">
                                        <div className="flex items-center gap-2">
                                            <ImageIcon className="h-4 w-4" /> Imagen
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="document" className="py-3 font-bold">
                                        <div className="flex items-center gap-2">
                                            <FileIcon className="h-4 w-4" /> Documento (PDF)
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="link" className="py-3 font-bold">
                                        <div className="flex items-center gap-2">
                                            <LinkIcon className="h-4 w-4" /> Enlace Externo
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {mediaForm.data.file_type === 'video' && (
                            <div className="space-y-2 rounded-2xl border-2 border-dashed border-brand-blue/30 bg-brand-blue/5 p-4">
                                <Label className="flex items-center gap-2 text-xs font-black tracking-wider text-brand-navy uppercase">
                                    <UploadCloud className="h-4 w-4 text-brand-blue" />
                                    Subir Video MP4 por Fragmentos (Opcional)
                                </Label>
                                <Input
                                    type="file"
                                    accept=".mp4,video/mp4"
                                    disabled={chunkUploading}
                                    onChange={(e) => {
                                        const f = e.target.files?.[0];

                                        if (f) {
handleChunkVideoUpload(f);
}
                                    }}
                                    className="rounded-xl bg-white"
                                />
                                {(chunkUploading || chunkProgress > 0) && (
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[11px] font-bold text-brand-blue">
                                            <span>
                                                {chunkUploading
                                                    ? 'Subiendo fragmentos...'
                                                    : 'Subida completada'}
                                            </span>
                                            <span>{chunkProgress}%</span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-white">
                                            <div
                                                className="h-full bg-brand-blue transition-all"
                                                style={{ width: `${chunkProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label className="font-bold">Ruta / URL del Recurso</Label>
                            <Input
                                value={mediaForm.data.file_path}
                                onChange={(e) =>
                                    mediaForm.setData('file_path', e.target.value)
                                }
                                placeholder="https://youtube.com/... o nombre de archivo subido"
                                className="h-12 rounded-xl border-2"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <Switch
                                checked={mediaForm.data.is_downloadable}
                                onCheckedChange={(val) =>
                                    mediaForm.setData('is_downloadable', val)
                                }
                            />
                            <Label className="text-sm font-bold">Permitir descarga</Label>
                        </div>
                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsMediaModalOpen(false)}
                                className="h-12 font-bold"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    mediaForm.processing ||
                                    chunkUploading ||
                                    !mediaForm.data.file_path
                                }
                                className="h-12 rounded-xl bg-brand-blue px-10 font-black tracking-widest uppercase shadow-lg shadow-brand-blue/20"
                            >
                                Agregar Recurso
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Import Modal */}
            <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
                <DialogContent className="overflow-hidden rounded-[2rem] border-0 p-0 shadow-2xl sm:max-w-[425px]">
                    <div className="relative flex flex-col gap-2 overflow-hidden bg-brand-navy p-6">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <FileText className="h-24 w-24" />
                        </div>
                        <DialogTitle className="relative z-10 text-2xl font-black tracking-tight text-white uppercase">
                            Importar Preguntas
                        </DialogTitle>
                    </div>
                    <div className="p-6">
                        <div className="mb-6 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-500">
                            <p className="mb-2">
                                <strong>Formato Sapius Legacy (Excel/CSV)</strong>
                            </p>
                            <p>
                                El archivo debe contener en la fila 1 la cabecera:{' '}
                                <code className="rounded bg-gray-200 px-1 py-0.5 text-xs">
                                    slug | pregunta | retro | r1 | r2 | r3 | r4 | ... | correcta
                                    | score | imagen
                                </code>
                            </p>
                        </div>
                        <form onSubmit={handleImportSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black tracking-widest text-brand-navy/60 uppercase">
                                    Archivo Excel (.xlsx, .csv)
                                </Label>
                                <Input
                                    type="file"
                                    accept=".xlsx, .xls, .csv"
                                    onChange={(e) =>
                                        importForm.setData(
                                            'file',
                                            e.target.files?.[0] || null,
                                        )
                                    }
                                    className="h-12 rounded-xl border-gray-100 font-bold file:mr-4 file:h-12 file:rounded-xl file:border-0 file:bg-brand-blue/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-blue hover:file:bg-brand-blue/20"
                                />
                                {importForm.errors.file && (
                                    <p className="text-xs text-red-500">
                                        {importForm.errors.file}
                                    </p>
                                )}
                            </div>
                            <DialogFooter className="gap-2 sm:gap-0">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsImportModalOpen(false)}
                                    className="h-12 text-[10px] font-black tracking-widest uppercase"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={
                                        importForm.processing || !importForm.data.file
                                    }
                                    className="h-12 rounded-xl bg-brand-blue px-8 text-[10px] font-black tracking-widest text-white uppercase shadow-lg shadow-brand-blue/20 hover:bg-brand-blue/90"
                                >
                                    Subir e Importar
                                </Button>
                            </DialogFooter>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Create / Edit Question Modal */}
            <Dialog open={isQuestionModalOpen} onOpenChange={setIsQuestionModalOpen}>
                <DialogContent className="sm:max-w-3xl overflow-hidden rounded-[2.5rem] border-2 p-0 shadow-2xl">
                    <div className="flex items-center justify-between bg-brand-navy p-8 text-white">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-3 font-black tracking-tight uppercase">
                                <HelpCircle className="h-6 w-6 text-brand-coral" />
                                {editingQuestion
                                    ? `Editar Pregunta #${editingQuestion.id}`
                                    : 'Nueva Pregunta (Opción Múltiple)'}
                            </DialogTitle>
                        </DialogHeader>
                        <Badge className="h-8 rounded-xl bg-brand-coral px-4 text-[10px] font-black tracking-widest text-white uppercase">
                            {questionFormState.answers.length} Respuestas
                        </Badge>
                    </div>
                    <form
                        onSubmit={handleSaveQuestion}
                        className="max-h-[70vh] space-y-5 overflow-y-auto p-8"
                    >
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black tracking-widest text-brand-navy/60 uppercase">
                                    Slug / Identificador (Opcional)
                                </Label>
                                <Input
                                    value={questionFormState.slug}
                                    onChange={(e) =>
                                        setQuestionFormState({
                                            ...questionFormState,
                                            slug: e.target.value,
                                        })
                                    }
                                    placeholder="ej. cardio-pregunta-01"
                                    className="h-11 rounded-xl border-2 font-mono text-xs"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black tracking-widest text-brand-navy/60 uppercase">
                                    Puntaje (Decimales permitidos)
                                </Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min={0}
                                    required
                                    value={questionFormState.points}
                                    onChange={(e) =>
                                        setQuestionFormState({
                                            ...questionFormState,
                                            points: e.target.value,
                                        })
                                    }
                                    className="h-11 rounded-xl border-2 font-bold"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black tracking-widest text-brand-navy/60 uppercase">
                                Texto de la Pregunta *
                            </Label>
                            <RichTextEditor
                                variant="full"
                                minHeightClassName="min-h-[130px]"
                                content={questionFormState.text}
                                onChange={(val) =>
                                    setQuestionFormState({
                                        ...questionFormState,
                                        text: val,
                                    })
                                }
                                imageUploadUrl={`${prefix}/editor/upload-image`}
                                imageUploadExtraData={{ course_id: course.id }}
                                placeholder="Escribe el planteamiento de la pregunta..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black tracking-widest text-brand-navy/60 uppercase">
                                Retroalimentación / Explicación Pedagógica
                            </Label>
                            <RichTextEditor
                                variant="full"
                                minHeightClassName="min-h-[110px]"
                                content={questionFormState.explanation}
                                onChange={(val) =>
                                    setQuestionFormState({
                                        ...questionFormState,
                                        explanation: normalizeOptionalRichHtml(val),
                                    })
                                }
                                imageUploadUrl={`${prefix}/editor/upload-image`}
                                imageUploadExtraData={{ course_id: course.id }}
                                placeholder="Ej: La respuesta es correcta debido al principio de..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black tracking-widest text-brand-navy/60 uppercase">
                                Imagen de Apoyo (Opcional)
                            </Label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    setQuestionImageFile(file);

                                    if (file) {
                                        setQuestionImagePreview(URL.createObjectURL(file));
                                    }
                                }}
                                className="rounded-xl border-2"
                            />
                            {questionImagePreview && (
                                <img
                                    src={questionImagePreview}
                                    alt="Vista previa de pregunta"
                                    className="mt-2 max-h-40 rounded-xl border object-contain"
                                />
                            )}
                        </div>

                        <div className="space-y-4">
                            <Label className="text-[10px] font-black tracking-widest text-brand-blue uppercase">
                                Opciones de Respuesta
                            </Label>
                            {questionFormState.answers.map((a, idx) => (
                                <div
                                    key={idx}
                                    className={cn(
                                        'space-y-2 rounded-2xl border-2 p-3 transition-colors',
                                        a.is_correct
                                            ? 'border-green-300 bg-green-50/20'
                                            : 'border-neutral-200/80 bg-white',
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        <div
                                            className={cn(
                                                'mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black',
                                                a.is_correct
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-gray-100 text-gray-500',
                                            )}
                                        >
                                            {String.fromCharCode(65 + idx)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <RichTextEditor
                                                variant="compact"
                                                content={a.text}
                                                onChange={(val) => {
                                                    const newAnswers = [
                                                        ...questionFormState.answers,
                                                    ];
                                                    newAnswers[idx] = {
                                                        ...newAnswers[idx],
                                                        text: val,
                                                    };
                                                    setQuestionFormState({
                                                        ...questionFormState,
                                                        answers: newAnswers,
                                                    });
                                                }}
                                                placeholder={`Texto de la opción ${String.fromCharCode(65 + idx)}`}
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant={a.is_correct ? 'default' : 'outline'}
                                            onClick={() => {
                                                const newAnswers =
                                                    questionFormState.answers.map(
                                                        (ans, i) => ({
                                                            ...ans,
                                                            is_correct: i === idx,
                                                        }),
                                                    );
                                                setQuestionFormState({
                                                    ...questionFormState,
                                                    answers: newAnswers,
                                                });
                                            }}
                                            className={cn(
                                                'mt-1 h-10 w-24 shrink-0 rounded-xl text-[9px] font-black tracking-widest uppercase transition-all',
                                                a.is_correct
                                                    ? 'bg-green-600 shadow-lg shadow-green-600/20 hover:bg-green-700'
                                                    : 'border-2 text-gray-400 hover:bg-gray-50',
                                            )}
                                        >
                                            {a.is_correct ? 'Correcta' : 'Marcar'}
                                        </Button>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3 pl-10">
                                        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-neutral-300 px-2.5 py-1 text-[11px] font-medium text-neutral-600 hover:bg-neutral-50">
                                            <ImageIcon className="h-3.5 w-3.5 text-brand-blue" />
                                            <span>
                                                {answerImagePreviews[idx]
                                                    ? 'Cambiar imagen de opción'
                                                    : 'Adjuntar imagen (opcional)'}
                                            </span>
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file =
                                                        e.target.files?.[0] ||
                                                        null;
                                                    setAnswerImageFiles((prev) => ({
                                                        ...prev,
                                                        [idx]: file,
                                                    }));

                                                    if (file) {
                                                        setAnswerImagePreviews(
                                                            (prev) => ({
                                                                ...prev,
                                                                [idx]: URL.createObjectURL(
                                                                    file,
                                                                ),
                                                            }),
                                                        );
                                                    }
                                                }}
                                            />
                                        </label>
                                        {answerImagePreviews[idx] && (
                                            <img
                                                src={answerImagePreviews[idx]!}
                                                alt={`Vista previa opción ${String.fromCharCode(65 + idx)}`}
                                                className="max-h-16 rounded-lg border object-contain"
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <DialogFooter className="border-t pt-6">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsQuestionModalOpen(false)}
                                className="h-12 text-[10px] font-black tracking-widest uppercase"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={questionSaving}
                                className="h-12 rounded-2xl bg-brand-blue px-12 font-black tracking-widest uppercase shadow-xl shadow-brand-blue/30"
                            >
                                {questionSaving
                                    ? 'Guardando...'
                                    : editingQuestion
                                      ? 'Actualizar Pregunta'
                                      : 'Guardar Pregunta'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Global Scheduling Modal */}
            <ContentSchedulingModal
                isOpen={isSchedulingModalOpen}
                onClose={() => setIsSchedulingModalOpen(false)}
                title={schedulingTarget?.title || 'Contenido'}
                type={schedulingType}
                data={{
                    is_scheduled: schedulingTarget?.is_scheduled || false,
                    available_at: schedulingTarget?.available_at || null,
                    expires_at: schedulingTarget?.expires_at || null,
                }}
                onSave={handleSaveScheduling}
            />

            {/* Preview Modal */}
            <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
                <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto rounded-[2.5rem] border-2 p-0 shadow-2xl">
                    <div className="sticky top-0 z-20 flex items-center justify-between bg-brand-navy p-6 text-white">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-3 text-lg font-black tracking-tight uppercase">
                                <Eye className="h-5 w-5 text-brand-blue" />
                                Vista Previa de Alumno: {activeLesson?.title}
                            </DialogTitle>
                        </DialogHeader>
                        <Badge className="border border-brand-blue/40 bg-brand-blue/20 px-3 py-1 text-[9px] font-black tracking-widest text-brand-blue uppercase">
                            Simulación Alumno
                        </Badge>
                    </div>

                    <div className="space-y-6 p-8">
                        {activeLesson?.media &&
                        activeLesson.media.find(
                            (m) =>
                                m.file_type === 'video' ||
                                m.tipo === 'video' ||
                                m.tipo === 'videoext',
                        ) ? (
                            (() => {
                                const vMedia = activeLesson.media.find(
                                    (m) =>
                                        m.file_type === 'video' ||
                                        m.tipo === 'video' ||
                                        m.tipo === 'videoext',
                                );
                                const videoPath =
                                    vMedia?.file_path || vMedia?.ruta || vMedia?.url || '';
                                const isHttp = videoPath.includes('http');

                                return (
                                    <div className="aspect-video w-full overflow-hidden rounded-2xl border border-neutral-800 bg-black shadow-lg">
                                        {isHttp ? (
                                            <iframe
                                                src={getEmbedVideoUrl(videoPath)}
                                                title={vMedia?.title || activeLesson.title}
                                                className="h-full w-full border-0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            />
                                        ) : (
                                            <video
                                                controls
                                                className="h-full w-full object-cover"
                                                src={
                                                    videoPath
                                                        ? `/alumno/medias/stream/${videoPath}`
                                                        : ''
                                                }
                                            >
                                                Tu navegador no soporta el formato de video.
                                            </video>
                                        )}
                                    </div>
                                );
                            })()
                        ) : (
                            <div className="flex aspect-video w-full flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-brand-navy to-brand-navy/80 p-6 text-center text-white">
                                <BookOpen className="mb-3 h-12 w-12 text-brand-blue/60" />
                                <h3 className="text-xl font-bold">{activeLesson?.title}</h3>
                                <p className="mt-1 text-xs text-white/60">
                                    Esta lección no contiene video principal.
                                </p>
                            </div>
                        )}

                        {activeLesson?.media && activeLesson.media.length > 0 && (
                            <div className="space-y-3 pt-2">
                                <h4 className="text-xs font-black tracking-widest text-brand-navy/60 uppercase">
                                    Recursos de la Lección
                                </h4>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {activeLesson.media.map((m) => (
                                        <div
                                            key={m.id}
                                            className="flex items-center gap-3 rounded-xl border bg-gray-50/50 p-3"
                                        >
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-blue/10 text-xs font-bold text-brand-blue">
                                                {m.file_type === 'video' ? (
                                                    <Play className="h-4 w-4" />
                                                ) : (
                                                    <FileText className="h-4 w-4" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-xs font-bold text-brand-navy">
                                                    {m.title}
                                                </p>
                                                <p className="truncate text-[10px] text-muted-foreground">
                                                    {m.file_path || m.ruta}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-3 border-t pt-4">
                            <h4 className="text-xs font-black tracking-widest text-brand-navy/60 uppercase">
                                Contenido Teórico
                            </h4>
                            <div className="prose prose-sm min-h-[120px] max-w-none rounded-2xl border border-gray-100 bg-gray-50 p-6">
                                {activeLesson?.content ? (
                                    <MathHtml html={activeLesson.content} />
                                ) : (
                                    <p className="text-xs text-muted-foreground italic">
                                        Sin contenido teórico registrado.
                                    </p>
                                )}
                            </div>
                        </div>

                        {activeQuiz && (
                            <div className="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 p-4">
                                <div className="flex items-center gap-3">
                                    <HelpCircle className="h-6 w-6 text-amber-600" />
                                    <div>
                                        <p className="text-sm font-bold text-amber-900">
                                            {activeQuiz.title || 'Evaluación'}
                                        </p>
                                        <p className="text-xs text-amber-700">
                                            {activeQuiz.questions?.length ?? 0} preguntas
                                            configuradas
                                        </p>
                                    </div>
                                </div>
                                <Badge className="bg-amber-600 text-[9px] font-black text-white uppercase">
                                    {activeQuiz.type || 'Examen'}
                                </Badge>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="border-t bg-gray-50 p-6">
                        <Button
                            onClick={() => setIsPreviewModalOpen(false)}
                            className="rounded-xl bg-brand-navy px-8 text-[10px] font-black tracking-widest uppercase"
                        >
                            Cerrar Vista Previa
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Video Player Modal */}
            <Dialog
                open={previewVideoUrl !== null}
                onOpenChange={(open) => !open && setPreviewVideoUrl(null)}
            >
                <DialogContent className="max-w-3xl overflow-hidden rounded-[2.5rem] border-2 bg-black p-0 shadow-2xl">
                    <div className="flex items-center justify-between bg-neutral-900 p-4 text-white">
                        <span className="text-xs font-black tracking-widest text-neutral-400 uppercase">
                            Reproductor Multimedia
                        </span>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setPreviewVideoUrl(null)}
                            className="h-8 rounded-lg px-3 text-xs text-white hover:bg-white/10"
                        >
                            Cerrar
                        </Button>
                    </div>
                    <div className="aspect-video w-full bg-black">
                        {previewVideoUrl && previewVideoUrl.includes('http') ? (
                            <iframe
                                src={getEmbedVideoUrl(previewVideoUrl)}
                                title="Reproductor de Video"
                                className="h-full w-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        ) : previewVideoUrl ? (
                            <video controls autoPlay className="h-full w-full object-cover">
                                <source
                                    src={
                                        previewVideoUrl.startsWith('/')
                                            ? previewVideoUrl
                                            : `/alumno/medias/stream/${previewVideoUrl}`
                                    }
                                />
                                Tu navegador no soporta el video.
                            </video>
                        ) : null}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

Builder.layout = (page: ReactElement<{ routePrefix?: string }>) => {
    const prefix = normalizeRoutePrefix(page.props?.routePrefix);

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Cursos', href: `${prefix}/cursos` },
                { title: 'Constructor', href: '#' },
            ]}
        >
            {page}
        </AppLayout>
    );
};
