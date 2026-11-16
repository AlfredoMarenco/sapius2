<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AccountBlockedEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;

    public string $reason;

    public int $strikes;

    public function __construct($user, string $reason = 'Violación de políticas antiplagio', int $strikes = 100)
    {
        $this->user = $user;
        $this->reason = $reason;
        $this->strikes = $strikes;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Aviso de seguridad: Cuenta bloqueada temporalmente - SAPIUS',
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.users.account_blocked',
            with: [
                'user' => $this->user,
                'reason' => $this->reason,
                'strikes' => $this->strikes,
            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
