<?php

namespace App\Mail;

use App\Models\ScheduledCourse;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Throwable;

class AutoAceptacionEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $inscripcion;

    /**
     * Create a new message instance.
     */
    public function __construct($inscripcion)
    {
        $this->inscripcion = $inscripcion;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Confirmación de Acceso: '.$this->resolveCourseTitle(),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        $scheduled = $this->resolveScheduledCourse();
        $course = $this->resolveCourse($scheduled);
        $user = $this->resolveUser();

        return new Content(
            markdown: 'emails.users.auto_aceptacion',
            with: [
                'inscripcion' => $this->inscripcion,
                'courseTitle' => $this->resolveCourseTitle($scheduled, $course),
                'scheduledCourse' => $scheduled,
                'courseModel' => $course,
                'studentUser' => $user,
            ]
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }

    protected function resolveScheduledCourse()
    {
        try {
            if (method_exists($this->inscripcion, 'scheduledCourse')) {
                $scheduled = $this->inscripcion->scheduledCourse;
                if ($scheduled) {
                    return $scheduled;
                }
            }
        } catch (Throwable) {
        }

        try {
            if (method_exists($this->inscripcion, 'CursoProgramado')) {
                $scheduled = $this->inscripcion->CursoProgramado;
                if ($scheduled) {
                    return $scheduled;
                }
            }
        } catch (Throwable) {
        }

        if (! empty($this->inscripcion->curso_programado_id)) {
            return ScheduledCourse::with(['course', 'category'])->find($this->inscripcion->curso_programado_id);
        }

        return null;
    }

    protected function resolveCourse($scheduledCourse)
    {
        if (! $scheduledCourse) {
            return null;
        }

        try {
            if (method_exists($scheduledCourse, 'course')) {
                $course = $scheduledCourse->course;
                if ($course) {
                    return $course;
                }
            }
        } catch (Throwable) {
        }

        try {
            if (method_exists($scheduledCourse, 'Curso')) {
                $course = $scheduledCourse->Curso;
                if ($course) {
                    return $course;
                }
            }
        } catch (Throwable) {
        }

        return null;
    }

    protected function resolveUser()
    {
        try {
            if (method_exists($this->inscripcion, 'user')) {
                $user = $this->inscripcion->user;
                if ($user) {
                    return $user;
                }
            }
        } catch (Throwable) {
        }

        try {
            if (method_exists($this->inscripcion, 'User')) {
                $user = $this->inscripcion->User;
                if ($user) {
                    return $user;
                }
            }
        } catch (Throwable) {
        }

        if (! empty($this->inscripcion->user_id)) {
            return User::find($this->inscripcion->user_id);
        }

        return null;
    }

    protected function resolveCourseTitle($scheduled = null, $course = null): string
    {
        $scheduled ??= $this->resolveScheduledCourse();
        $course ??= $this->resolveCourse($scheduled);

        return (string) (
            $course?->title
            ?? $course?->titulo
            ?? $scheduled?->identificador
            ?? $scheduled?->internal_id
            ?? 'SAPIUS'
        );
    }
}
