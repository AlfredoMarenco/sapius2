<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TareaEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $datos;

    public ?string $filePath;

    /**
     * Create a new message instance.
     */
    public function __construct($datos, ?string $filePath = null)
    {
        $this->datos = $datos;
        $this->filePath = $filePath;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Notificación de Tarea - SAPIUS',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.academic.tarea',
            with: [
                'datos' => $this->datos,
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
        if ($this->filePath && is_file($this->filePath)) {
            return [
                Attachment::fromPath($this->filePath),
            ];
        }

        return [];
    }
}
