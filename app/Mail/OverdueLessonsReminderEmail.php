<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OverdueLessonsReminderEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $student;
    public $overdueLessons;

    /**
     * Create a new message instance.
     */
    public function __construct($student, $overdueLessons)
    {
        $this->student = $student;
        $this->overdueLessons = $overdueLessons;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Recordatorio de Lecciones Pendientes - SAPIUS',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.academic.overdue_lessons',
            with: [
                'student' => $this->student,
                'overdueLessons' => $this->overdueLessons
            ]
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
