import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface PreviewProps {
    quiz: any;
    enrollment_id: number;
    attemptsCount: number;
    exams: any[];
}

export default function Preview({ quiz, enrollment_id, attemptsCount, exams }: PreviewProps) {
    const attemptsLeft = quiz.attempts_allowed - attemptsCount;
    const canTake = attemptsLeft > 0;

    return (
        <>
            <Head title={`Examen: ${quiz.title}`} />
            
            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <Card className="shadow-lg border-t-4 border-t-indigo-500">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold text-gray-800">{quiz.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="prose max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: quiz.description }} />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                                    <Clock className="w-6 h-6 text-indigo-500 mr-3" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-500">Tiempo límite</p>
                                        <p className="text-lg text-gray-800">{quiz.time_limit} Minutos</p>
                                    </div>
                                </div>
                                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                                    <CheckCircle className="w-6 h-6 text-indigo-500 mr-3" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-500">Intentos permitidos</p>
                                        <p className="text-lg text-gray-800">{quiz.attempts_allowed}</p>
                                    </div>
                                </div>
                                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                                    <AlertTriangle className="w-6 h-6 text-indigo-500 mr-3" />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-500">Intentos realizados</p>
                                        <p className="text-lg text-gray-800">{attemptsCount}</p>
                                    </div>
                                </div>
                            </div>

                            {exams.length > 0 && (
                                <div className="mt-8">
                                    <h3 className="text-lg font-bold mb-4">Tus Intentos Previos</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-100 border-b">
                                                    <th className="p-3 text-sm font-semibold text-gray-600">Fecha</th>
                                                    <th className="p-3 text-sm font-semibold text-gray-600">Aciertos</th>
                                                    <th className="p-3 text-sm font-semibold text-gray-600">Score Total</th>
                                                    <th className="p-3 text-sm font-semibold text-gray-600">Acción</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {exams.map((exam) => (
                                                    <tr key={exam.id} className="border-b hover:bg-gray-50">
                                                        <td className="p-3 text-sm text-gray-800">{new Date(exam.finished_at || exam.updated_at).toLocaleString()}</td>
                                                        <td className="p-3 text-sm text-gray-800">{exam.total_correctas} / {exam.total_preguntas}</td>
                                                        <td className="p-3 text-sm text-gray-800">{exam.score_total}</td>
                                                        <td className="p-3 text-sm text-gray-800">
                                                            <Link href={`/alumno/exams/${exam.id}/feedback`} className="text-indigo-600 hover:text-indigo-800 underline">
                                                                Ver Retroalimentación
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex justify-between mt-4">
                            <Link href="/alumno">
                                <Button variant="outline">Volver</Button>
                            </Link>
                            {canTake ? (
                                <Link href={`/alumno/exams/${quiz.id}/take/${enrollment_id}`}>
                                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">Comenzar Examen</Button>
                                </Link>
                            ) : (
                                <p className="text-red-500 font-semibold">Has agotado tus intentos para este examen.</p>
                            )}
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </>
    );
}
