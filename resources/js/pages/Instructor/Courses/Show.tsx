import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Settings, 
    ArrowLeft, 
    Users, 
    Calendar, 
    Activity, 
    GraduationCap, 
    Award, 
    FileText, 
    CheckCircle2, 
    Clock, 
    AlertTriangle, 
    Layers,
    BookOpen
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription 
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface ExamItem {
    id: number;
    quiz_id?: number;
    quiz_title: string;
    title?: string;
    score: number;
    score_total: number;
    total_preguntas?: number | null;
    total_correctas?: number | null;
    total_questions?: number | null;
    correct_answers?: number | null;
    status: string;
    finalizado: string;
    is_late: boolean;
    date: string | null;
}

export interface HomeworkItem {
    id: number;
    lesson_id: number;
    lesson_title: string;
    title?: string;
    is_late: boolean;
    submitted_at: string | null;
    status: string;
}

export interface Student {
    id: number;
    enrollment_id: number;
    name: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    email: string;
    avatar?: string | null;
    foto?: string | null;
    cohort: string;
    enrolled_at: string | null;
    status: string;
    progress_percent: number;
    exams: ExamItem[];
    exams_average: number;
    homeworks: HomeworkItem[];
    homework_completed_count: number;
}

export interface Cohort {
    id: number;
    identificador: string;
    internal_id?: string;
    fecha_inicio: string | null;
    fecha_fin: string | null;
    start_date?: string | null;
    end_date?: string | null;
    active_students_count: number;
    user_id?: number;
    instructor_id?: number;
}

export interface Course {
    id: number;
    title: string;
    description: string;
    modules?: any[];
    category?: {
        id: number;
        name: string;
    };
}

export interface CourseShowProps {
    course: Course;
    cohorts?: Cohort[];
    selectedCohortId?: number | null;
    selectedCohort?: Cohort | null;
    students?: Student[];
    total_cohorts?: number;
}

export default function Show({
    course,
    cohorts = [],
    selectedCohortId = null,
    selectedCohort = null,
    students = [],
    total_cohorts = 0,
}: CourseShowProps) {
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    const handleCohortChange = (cohortId: string) => {
        router.get(
            `/instructor/cursos/${course.id}/view`,
            { cohort_id: cohortId },
            { preserveState: true }
        );
    };

    const currentCohort = cohorts.find(c => c.id === selectedCohortId) || selectedCohort || cohorts[0];

    return (
        <>
            <Head title={`Curso: ${course.title}`} />
            
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Link href="/instructor/cursos" className="text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <h1 className="text-2xl font-bold tracking-tight">{course.title}</h1>
                    </div>
                    <p className="text-muted-foreground">Panel de detalles del curso y alumnos inscritos por cohorte</p>
                </div>
                
                <Link
                    href={`/instructor/cursos/${course.id}/builder`}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2"
                >
                    <Settings className="h-4 w-4" />
                    Abrir Course Builder
                </Link>
            </div>

            {/* Stat Cards */}
            <div className="grid gap-6 md:grid-cols-3 mb-8">
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 text-blue-500 rounded-full">
                        <Users className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Alumnos Activos</p>
                        <h3 className="text-2xl font-bold">{students.length}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">En cohorte seleccionada</p>
                    </div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 text-purple-500 rounded-full">
                        <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Grupos Asignados</p>
                        <h3 className="text-2xl font-bold">{total_cohorts || cohorts.length}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Total de cohortes del instructor</p>
                    </div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex items-center gap-4">
                    <div className="p-3 bg-green-500/10 text-green-500 rounded-full">
                        <Activity className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Módulo Calificaciones</p>
                        <h3 className="text-2xl font-bold text-green-600">Activo</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Exámenes y Tareas</p>
                    </div>
                </div>
            </div>

            {/* Main Section */}
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden mb-8">
                <div className="p-6 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-primary" />
                            Alumnos Inscritos ({students.length})
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {currentCohort ? (
                                <>
                                    Mostrando alumnos activos del grupo <strong>{currentCohort.identificador}</strong>
                                    {currentCohort.fecha_inicio && (
                                        <span className="ml-1 text-xs">
                                            ({currentCohort.fecha_inicio} al {currentCohort.fecha_fin || 'Indefinido'})
                                        </span>
                                    )}
                                </>
                            ) : (
                                'Alumnos inscritos en las cohortes de este curso.'
                            )}
                        </p>
                    </div>

                    {/* Cohort Selector */}
                    {cohorts.length > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap flex items-center gap-1">
                                <Layers className="h-4 w-4" />
                                Cohorte:
                            </span>
                            <Select
                                value={currentCohort ? String(currentCohort.id) : ''}
                                onValueChange={handleCohortChange}
                            >
                                <SelectTrigger className="w-[220px]">
                                    <SelectValue placeholder="Seleccionar cohorte" />
                                </SelectTrigger>
                                <SelectContent>
                                    {cohorts.map((cohort) => (
                                        <SelectItem key={cohort.id} value={String(cohort.id)}>
                                            <div className="flex items-center justify-between w-full gap-2">
                                                <span>{cohort.identificador}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    ({cohort.active_students_count} alumnos)
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>

                {students.length > 0 ? (
                    <div className="w-full overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Alumno</TableHead>
                                    <TableHead>Cohorte</TableHead>
                                    <TableHead>Avance</TableHead>
                                    <TableHead>Promedio Exámenes</TableHead>
                                    <TableHead>Tareas</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.map((student) => {
                                    const completedExamsCount = student.exams.filter(e => e.finalizado === 'si').length;
                                    const avatarSrc = student.avatar || student.foto;

                                    return (
                                        <TableRow key={`${student.id}-${student.enrollment_id}`}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9">
                                                        {avatarSrc && <AvatarImage src={`/storage/${avatarSrc}`} alt={student.name} />}
                                                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                                            {student.name.substring(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-sm text-foreground">
                                                            {student.full_name || student.name}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">{student.email}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{student.cohort}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 min-w-[120px]">
                                                    <Progress value={student.progress_percent} className="h-2 flex-1" />
                                                    <span className="text-xs font-medium text-muted-foreground w-8 text-right">
                                                        {student.progress_percent}%
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-sm">
                                                        {student.exams_average > 0 ? `${student.exams_average.toFixed(1)} pts` : '—'}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {completedExamsCount} de {student.exams.length} examen(es)
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 text-sm">
                                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                                    <span>{student.homework_completed_count} entregada(s)</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {student.status === 'si' ? (
                                                    <Badge className="bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300 hover:bg-green-100">
                                                        Aceptado
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary">Pendiente</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 gap-1.5 text-xs font-medium"
                                                    onClick={() => setSelectedStudent(student)}
                                                >
                                                    <Award className="h-3.5 w-3.5 text-primary" />
                                                    Ver Calificaciones
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="p-12 text-center text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p className="font-medium">No hay alumnos activos en este grupo.</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {cohorts.length > 1 ? 'Prueba seleccionando otra cohorte en el selector superior.' : 'Aún no se han aceptado inscripciones en este curso.'}
                        </p>
                    </div>
                )}
            </div>

            {/* Student Grades & Academic Performance Dialog */}
            <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                    {selectedStudent && (
                        <>
                            <DialogHeader className="border-b pb-4">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-12 w-12">
                                            {(selectedStudent.avatar || selectedStudent.foto) && (
                                                <AvatarImage 
                                                    src={`/storage/${selectedStudent.avatar || selectedStudent.foto}`} 
                                                    alt={selectedStudent.name} 
                                                />
                                            )}
                                            <AvatarFallback className="bg-primary/10 text-primary text-base font-bold">
                                                {selectedStudent.name.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <DialogTitle className="text-xl">
                                                {selectedStudent.full_name || selectedStudent.name}
                                            </DialogTitle>
                                            <DialogDescription className="text-sm">
                                                {selectedStudent.email} • {selectedStudent.cohort}
                                            </DialogDescription>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 bg-muted/50 p-2.5 rounded-lg border">
                                        <div className="text-center px-2">
                                            <span className="text-xs text-muted-foreground block">Avance</span>
                                            <span className="text-lg font-bold">{selectedStudent.progress_percent}%</span>
                                        </div>
                                        <div className="h-8 w-px bg-border" />
                                        <div className="text-center px-2">
                                            <span className="text-xs text-muted-foreground block">Promedio</span>
                                            <span className="text-lg font-bold text-primary">
                                                {selectedStudent.exams_average > 0 ? selectedStudent.exams_average.toFixed(1) : '—'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </DialogHeader>

                            <Tabs defaultValue="exams" className="mt-4">
                                <TabsList className="grid grid-cols-2 mb-4">
                                    <TabsTrigger value="exams" className="flex items-center gap-2">
                                        <Award className="h-4 w-4" />
                                        Evaluaciones y Exámenes ({selectedStudent.exams.length})
                                    </TabsTrigger>
                                    <TabsTrigger value="homeworks" className="flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        Tareas y Entregas ({selectedStudent.homeworks.length})
                                    </TabsTrigger>
                                </TabsList>

                                {/* Exams Breakdown Tab */}
                                <TabsContent value="exams" className="space-y-4">
                                    {selectedStudent.exams.length > 0 ? (
                                        <div className="border rounded-lg overflow-hidden">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-muted/50">
                                                        <TableHead>Evaluación</TableHead>
                                                        <TableHead className="text-center">Calificación</TableHead>
                                                        <TableHead className="text-center">Aciertos</TableHead>
                                                        <TableHead className="text-center">Estado</TableHead>
                                                        <TableHead className="text-center">Puntualidad</TableHead>
                                                        <TableHead className="text-right">Fecha</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {selectedStudent.exams.map((exam) => (
                                                        <TableRow key={exam.id}>
                                                            <TableCell className="font-medium text-sm">
                                                                {exam.quiz_title || exam.title || 'Evaluación'}
                                                            </TableCell>
                                                            <TableCell className="text-center font-bold">
                                                                {exam.score_total ?? exam.score} pts
                                                            </TableCell>
                                                            <TableCell className="text-center text-sm text-muted-foreground">
                                                                {(exam.total_preguntas ?? exam.total_questions) ? (
                                                                    `${exam.total_correctas ?? exam.correct_answers ?? 0} / ${exam.total_preguntas ?? exam.total_questions}`
                                                                ) : (
                                                                    '—'
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                {exam.status === 'Finalizado' || exam.finalizado === 'si' ? (
                                                                    <Badge className="bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300">
                                                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                                                        Finalizado
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge variant="outline" className="text-amber-600 border-amber-300">
                                                                        <Clock className="h-3 w-3 mr-1" />
                                                                        En progreso
                                                                    </Badge>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                {exam.is_late ? (
                                                                    <Badge variant="destructive" className="text-xs">
                                                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                                                        Tardío
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge variant="outline" className="text-xs text-muted-foreground">
                                                                        A tiempo
                                                                    </Badge>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
                                                                {exam.date || '—'}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center text-muted-foreground border rounded-lg bg-muted/20">
                                            <Award className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                            <p className="text-sm font-medium">No se registran evaluaciones para este alumno.</p>
                                        </div>
                                    )}
                                </TabsContent>

                                {/* Homework Breakdown Tab */}
                                <TabsContent value="homeworks" className="space-y-4">
                                    {selectedStudent.homeworks.length > 0 ? (
                                        <div className="border rounded-lg overflow-hidden">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-muted/50">
                                                        <TableHead>Lección / Tarea</TableHead>
                                                        <TableHead className="text-center">Estado</TableHead>
                                                        <TableHead className="text-center">Puntualidad</TableHead>
                                                        <TableHead className="text-right">Fecha de Entrega</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {selectedStudent.homeworks.map((hw) => (
                                                        <TableRow key={hw.id}>
                                                            <TableCell className="font-medium text-sm">
                                                                {hw.lesson_title || hw.title || 'Tarea'}
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                                                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                                                    Entregado
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                {hw.is_late ? (
                                                                    <Badge variant="destructive" className="text-xs">
                                                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                                                        Entrega tardía
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge variant="outline" className="text-xs text-green-700 border-green-200">
                                                                        A tiempo
                                                                    </Badge>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
                                                                {hw.submitted_at || '—'}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center text-muted-foreground border rounded-lg bg-muted/20">
                                            <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                            <p className="text-sm font-medium">No se registran tareas entregadas para este alumno.</p>
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

Show.layout = (page: React.ReactNode, { course }: any) => (
    <AppLayout breadcrumbs={[
        { title: 'Dashboard', href: '/instructor' },
        { title: 'Mis Cursos', href: '/instructor/cursos' },
        { title: course?.title || 'Curso', href: `/instructor/cursos/${course?.id}/view` }
    ]}>
        {page}
    </AppLayout>
);
