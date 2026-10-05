import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { useAntiCheat } from '@/hooks/useAntiCheat';

interface TakeProps {
    quiz: any;
    exam: any;
    questions: any[];
    savedAnswers: any[];
    timeLeft?: number;
}

export default function Take({ quiz, exam, questions, savedAnswers, timeLeft: initialTimeLeft }: TakeProps) {
    const { auth } = usePage<any>().props;
    const userEmail = auth?.user?.email || auth?.user?.username || 'Alumno';

    const { isBlurred, Watermark, StrikeAlert } = useAntiCheat({
        enabled: true,
        watermarkText: userEmail,
        onBlocked: () => {
            submitExam();
        }
    });
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const answersRef = React.useRef(answers);

    useEffect(() => {
        answersRef.current = answers;
    }, [answers]);

    // Si no se manda desde el backend, usamos el viejo comportamiento por si acaso, pero backend siempre debe mandarlo.
    const startingTime = initialTimeLeft !== undefined 
        ? initialTimeLeft 
        : (quiz.time_limit ? quiz.time_limit * 60 : 0);
        
    const [timeLeft, setTimeLeft] = useState(startingTime);

    useEffect(() => {
        const initialAnswers: Record<number, number> = {};
        savedAnswers.forEach((ans) => {
            initialAnswers[ans.name] = ans.value;
        });
        setAnswers(initialAnswers);
    }, [savedAnswers]);

    useEffect(() => {
        // Solo correr el temporizador si el examen tiene un límite de tiempo mayor a 0
        if (initialTimeLeft !== undefined && initialTimeLeft > 0) {
            if (timeLeft <= 0) {
                submitExam();
                return;
            }
            const timerId = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timerId);
        }
    }, [timeLeft, initialTimeLeft]);

    // Tracking de anti-trampas específico del examen y cierre inesperado
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                fetch(`/alumno/exams/${exam.id}/events`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || ''
                    },
                    body: JSON.stringify({
                        observacion: 'El alumno cambió de pestaña o minimizó el navegador',
                        lugar: 'Pantalla de Examen'
                    })
                }).catch(e => console.error(e));
            }
        };

        const handleUnload = () => {
            const currentAnswers = Object.keys(answersRef.current).map(qId => ({
                name: parseInt(qId),
                value: answersRef.current[parseInt(qId)]
            }));

            // Usamos sendBeacon para asegurar que se envíe incluso si la pestaña se cierra
            const formData = new FormData();
            formData.append('_token', (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '');
            // Para poder enviar el array JSON, lo convertimos a string, el controlador puede necesitar un pequeño ajuste si espera array
            // En PHP usaremos json_decode si es string, pero lo más fácil es mandarlo en crudo o como array
            formData.append('answers', JSON.stringify(currentAnswers));
            
            navigator.sendBeacon(`/alumno/exams/${exam.id}/finish-imprevisto`, formData);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('unload', handleUnload);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('unload', handleUnload);
        };
    }, [exam.id]);

    const formatTime = (seconds: number) => {
        const validSeconds = Math.max(0, Math.floor(seconds));
        const m = Math.floor(validSeconds / 60).toString().padStart(2, '0');
        const s = (validSeconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const currentQuestion = questions[currentIndex];

    const handleSelectAnswer = (questionId: number, answerId: number) => {
        const updatedAnswers = { ...answers, [questionId]: answerId };
        setAnswers(updatedAnswers);

        // Auto-save
        fetch(`/alumno/exams/${exam.id}/save-answer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || ''
            },
            body: JSON.stringify({
                answers: [{ name: questionId, value: answerId }]
            })
        }).catch(err => console.error("Error auto-saving", err));
    };

    const submitExam = () => {
        const formattedAnswers = Object.keys(answers).map(qId => ({
            name: parseInt(qId),
            value: answers[parseInt(qId)]
        }));

        router.post(`/alumno/exams/${exam.id}/finish`, {
            answers: formattedAnswers
        });
    };

    if (!currentQuestion) return <div>Cargando...</div>;

    return (
        <>
            <Head title={`Examen: ${quiz.title}`} />
            <StrikeAlert />
            <Watermark />

            <div className={`py-8 bg-gray-50 min-h-screen select-none ${isBlurred ? 'blur-xl pointer-events-none' : ''}`}>
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    {/* Header bar */}
                    <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow mb-6 sticky top-4 z-10 border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800">{quiz.title}</h2>
                        <div className="flex items-center space-x-6">
                            {initialTimeLeft !== undefined && initialTimeLeft > 0 ? (
                                <div className="flex items-center text-rose-500 font-bold bg-rose-50 px-3 py-1.5 rounded-full">
                                    <Clock className="w-5 h-5 mr-2" />
                                    {formatTime(timeLeft)}
                                </div>
                            ) : null}
                            <Button onClick={submitExam} variant="default" className="bg-green-600 hover:bg-green-700">
                                Finalizar Examen
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Question Area */}
                        <div className="md:col-span-3">
                            <Card className="shadow-md">
                                <CardContent className="p-8">
                                    <div className="mb-6 flex justify-between items-center border-b pb-4">
                                        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                                            Pregunta {currentIndex + 1} de {questions.length}
                                        </span>
                                    </div>
                                    
                                    <div className="prose max-w-none text-lg text-gray-800 mb-8" dangerouslySetInnerHTML={{ __html: currentQuestion.text }} />

                                    <div className="space-y-3">
                                        {currentQuestion.answers.map((ans: any) => (
                                            <label 
                                                key={ans.id} 
                                                className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors duration-200 ${
                                                    answers[currentQuestion.id] === ans.id 
                                                    ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' 
                                                    : 'border-gray-200 hover:bg-gray-50'
                                                }`}
                                            >
                                                <input 
                                                    type="radio" 
                                                    name={`question_${currentQuestion.id}`} 
                                                    className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                                    checked={answers[currentQuestion.id] === ans.id}
                                                    onChange={() => handleSelectAnswer(currentQuestion.id, ans.id)}
                                                />
                                                <div className="ml-3 text-gray-700 prose" dangerouslySetInnerHTML={{ __html: ans.text }} />
                                            </label>
                                        ))}
                                    </div>

                                    <div className="flex justify-between mt-8 pt-4 border-t">
                                        <Button 
                                            variant="outline" 
                                            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                                            disabled={currentIndex === 0}
                                        >
                                            Anterior
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                                            disabled={currentIndex === questions.length - 1}
                                        >
                                            Siguiente
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Navigation Sidebar */}
                        <div className="md:col-span-1">
                            <Card className="shadow-md sticky top-24">
                                <CardContent className="p-4">
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Navegación</h3>
                                    <div className="grid grid-cols-4 gap-2">
                                        {questions.map((q, idx) => {
                                            const isAnswered = !!answers[q.id];
                                            const isCurrent = currentIndex === idx;
                                            return (
                                                <button
                                                    key={q.id}
                                                    onClick={() => setCurrentIndex(idx)}
                                                    className={`
                                                        w-10 h-10 rounded-md flex items-center justify-center text-sm font-medium transition-all
                                                        ${isCurrent ? 'ring-2 ring-indigo-500 ring-offset-1' : ''}
                                                        ${isAnswered ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                                                    `}
                                                >
                                                    {idx + 1}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-6 border-t pt-4 space-y-2">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <div className="w-3 h-3 rounded-full bg-indigo-600 mr-2"></div>
                                            Respondidas ({Object.keys(answers).length})
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <div className="w-3 h-3 rounded-full bg-gray-200 mr-2 border border-gray-300"></div>
                                            Sin responder ({questions.length - Object.keys(answers).length})
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
