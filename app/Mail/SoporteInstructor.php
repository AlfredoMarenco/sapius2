<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Address;

class SoporteInstructor extends Mailable
{
    use Queueable, SerializesModels;

    public $data;
    public $user;

    public function __construct($data, $user)
    {
        $this->data = $data;
        $this->user = $user;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Soporte Instructor: ' . $this->data['asunto'],
            replyTo: [
                new Address($this->user->email, $this->user->name . ' ' . $this->user->last_name)
            ]
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: '<p><strong>Instructor:</strong> ' . $this->user->name . ' ' . $this->user->last_name . ' (' . $this->user->email . ')</p><p><strong>Mensaje:</strong><br/>' . nl2br(e($this->data['mensaje'])) . '</p>'
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
