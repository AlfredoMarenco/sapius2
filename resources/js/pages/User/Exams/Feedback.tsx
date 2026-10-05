import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import { useAntiCheat } from '@/hooks/useAntiCheat';

interface FeedbackProps {
    exam: any;
    feedback: any[];
    questions: any[];
    timeLeft?: number;
}

export default function Feedback({ exam, feedback, questions, timeLeft: initialTimeLeft }: FeedbackProps) {
    const { auth } = usePage<any>().props;
    const userEmail = auth?.user?.email || auth?.user?.username || 'Alumno';

    const { isBlurred, Watermark, StrikeAlert } = useAntiCheat({
        enabled: true,
        watermarkText: userEmail
    });
    const [timeLeft, setTimeLeft] = useState(initialTimeLeft || 0);

    useEffect(() => {
        if (initialTimeLeft && initialTimeLeft > 0) {
            if (timeLeft <= 0) {
                const redirectId = exam.enrollment?.curso_programado_id || exam.inscripcion?.curso_programado_id || exam.enrollment?.curso_id;
                router.visit(`/alumno/curso/${redirectId}`);
                return;
            }
            const timerId = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timerId);
        }
    }, [timeLeft, initialTimeLeft]);

    const formatTime = (seconds: number) => {
        const validSeconds = Math.max(0, Math.floor(seconds));
        const m = Math.floor(validSeconds / 60).toString().padStart(2, '0');
        const s = (validSeconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // Si no hay passing_score definido, asumimos que se pasa con 60% de las preguntas o un default
    const passThreshold = exam.quiz?.passing_score || (exam.total_preguntas > 0 ? (exam.total_preguntas * 0.6) : 0);
    // Para saber si pasó, evaluamos por el score o por el % de aciertos (dependiendo si es ENARM o EGEL)
    const isPassing = exam.total_preguntas > 0 
        ? (exam.total_correctas / exam.total_preguntas) >= 0.6 
        : exam.score >= passThreshold;

    return (
        <>
            <Head title="Resultados del Examen" />
            <StrikeAlert />
            <Watermark />
            
            <div className={`py-8 bg-gray-50 min-h-screen select-none ${isBlurred ? 'blur-xl pointer-events-none' : ''}`}>
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Header con temporizador */}
                    {initialTimeLeft && initialTimeLeft > 0 ? (
                        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow sticky top-4 z-10 border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800">Retroalimentación - {exam.quiz?.title}</h2>
                            <div className="flex items-center text-rose-500 font-bold bg-rose-50 px-3 py-1.5 rounded-full border border-rose-200 shadow-sm">
                                <Clock className="w-5 h-5 mr-2 animate-pulse" />
                                {formatTime(timeLeft)}
                            </div>
                        </div>
                    ) : null}

                    {/* Score Summary */}
                    <Card className="shadow-lg text-center overflow-hidden mt-6">
                        <div className={`h-3 ${isPassing ? 'bg-green-500' : 'bg-rose-500'}`}></div>
                        <CardHeader>
                            <CardTitle className="text-3xl font-extrabold text-gray-800">Tus Resultados</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center justify-center space-y-4">
                                {isPassing ? (
                                    <CheckCircle className="w-20 h-20 text-green-500" />
                                ) : (
                                    <XCircle className="w-20 h-20 text-rose-500" />
                                )}
                                <div className="text-5xl font-black text-gray-900 tracking-tight flex items-baseline gap-2">
                                    {exam.score ?? exam.score_total ?? 0} <span className="text-xl text-gray-500 font-medium tracking-normal">Puntos</span>
                                </div>
                                <p className="text-lg text-gray-600 font-medium">
                                    Aciertos: <span className="font-bold text-gray-900">{exam.total_correctas}</span> de {exam.total_preguntas}
                                </p>
                            </div>
                        </CardContent>
                        <CardFooter className="justify-center bg-gray-50 p-4 border-t">
                            <Link href="/alumno">
                                <Button variant="outline" className="mr-4">Volver al inicio</Button>
                            </Link>
                            <Link href={`/alumno/curso/${exam.enrollment?.curso_programado_id || exam.inscripcion?.curso_programado_id}`}>
                                <Button className="bg-indigo-600 hover:bg-indigo-700">Regresar al curso</Button>
                            </Link>
                        </CardFooter>
                    </Card>

                    {/* Detailed Feedback */}
                    {feedback && feedback.length > 0 && (
                        <Card className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-xl font-bold flex items-center">
                                    <AlertCircle className="w-5 h-5 mr-2 text-indigo-500" /> 
                                    Revisión del Examen
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {feedback.map((item, index) => {
                                    const question = questions.find(q => q.id === item.correct_answer.question_id);
                                    
                                    if (!question) return null;

                                    const userAnswerObj = question.answers.find((a: any) => a.id === item.user_answer.value);

                                    // Determinar colores según estado
                                    const isCorrect = item.status === 'correct';
                                    const isUnanswered = item.status === 'unanswered';
                                    
                                    const containerClass = isCorrect 
                                        ? "p-4 rounded-lg border border-green-200 bg-green-50"
                                        : (isUnanswered ? "p-4 rounded-lg border border-orange-200 bg-orange-50" : "p-4 rounded-lg border border-red-100 bg-red-50");
                                        
                                    const iconColor = isCorrect ? "text-green-500" : (isUnanswered ? "text-orange-500" : "text-red-500");
                                    const textColor = isCorrect ? "text-green-700" : (isUnanswered ? "text-orange-700" : "text-red-700");

                                    return (
                                        <div key={index} className={containerClass}>
                                            <div className="font-semibold text-gray-800 mb-2 prose" dangerouslySetInnerHTML={{ __html: question.text }} />
                                            
                                            <div className="mt-3 space-y-2 text-sm">
                                                <div className="flex items-start">
                                                    {isCorrect ? (
                                                        <CheckCircle className={`w-5 h-5 ${iconColor} mr-2 flex-shrink-0 mt-0.5`} />
                                                    ) : (
                                                        <XCircle className={`w-5 h-5 ${iconColor} mr-2 flex-shrink-0 mt-0.5`} />
                                                    )}
                                                    <div>
                                                        <span className={`font-bold ${textColor} block`}>Tu respuesta:</span>
                                                        <span className="text-gray-700 prose" dangerouslySetInnerHTML={{ __html: userAnswerObj ? userAnswerObj.text : '<em>No respondida</em>' }} />
                                                    </div>
                                                </div>
                                                
                                                {!isCorrect && (
                                                    <div className={`flex items-start pt-2 border-t ${isUnanswered ? 'border-orange-200' : 'border-red-100'}`}>
                                                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                                        <div>
                                                            <span className="font-bold text-green-700 block">Respuesta correcta:</span>
                                                            <span className="text-gray-700 prose" dangerouslySetInnerHTML={{ __html: item.correct_answer.text }} />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </>
    );
}
