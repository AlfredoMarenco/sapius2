<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InformacionEmail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * @var array<string, mixed>
     */
    public array $datos;

    /**
     * Create a new message instance.
     *
     * @param  array<string, mixed>|object  $datos
     */
    public function __construct(array|object $datos)
    {
        $this->datos = is_array($datos) ? $datos : (array) $datos;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $replyTo = [];
        $visitorEmail = trim((string) ($this->datos['email'] ?? ''));
        $visitorName = trim((string) ($this->datos['nombre'] ?? ''));

        if ($visitorEmail !== '' && filter_var($visitorEmail, FILTER_VALIDATE_EMAIL)) {
            $replyTo[] = new Address($visitorEmail, $visitorName !== '' ? $visitorName : null);
        }

        return new Envelope(
            replyTo: $replyTo,
            subject: '¡Nueva solicitud de más información! - SAPIUS',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.general.informacion',
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
        return [];
    }
}
