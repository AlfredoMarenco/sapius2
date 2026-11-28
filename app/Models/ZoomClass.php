<?php

namespace App\Models;

use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;

class ZoomClass extends Model
{
    protected $table = 'zoom_classes';

    protected $fillable = [
        'curso_programado_id',
        'curso_id',
        'module_id',
        'leccion_id',
        'instructor_id',
        'title',
        'description',
        'creation_mode',
        'meeting_number',
        'passcode',
        'join_url',
        'start_url',
        'scheduled_at',
        'duration_minutes',
        'status',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
            'duration_minutes' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function scheduledCourse()
    {
        return $this->belongsTo(ScheduledCourse::class, 'curso_programado_id');
    }

    public function course()
    {
        return $this->belongsTo(Course::class, 'curso_id');
    }

    public function module()
    {
        return $this->belongsTo(Module::class, 'module_id')->withoutGlobalScopes();
    }

    public function lesson()
    {
        return $this->belongsTo(Lesson::class, 'leccion_id')->withoutGlobalScopes();
    }

    public function instructor()
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    public function endsAt(): CarbonInterface
    {
        $start = $this->scheduled_at ? $this->scheduled_at->copy() : now();

        return $start->addMinutes(max(15, (int) ($this->duration_minutes ?? 60)));
    }

    public function computedStatus(?Carbon $referenceTime = null): string
    {
        if (! $this->is_active || $this->status === 'cancelled') {
            return 'cancelled';
        }

        if ($this->status === 'ended') {
            return 'ended';
        }

        if ($this->status === 'live') {
            return 'live';
        }

        $now = $referenceTime ?? now();
        $windowStart = $this->scheduled_at->copy()->subMinutes(15);
        $windowEnd = $this->endsAt()->copy()->addMinutes(30);

        if ($now->between($windowStart, $windowEnd)) {
            return 'live';
        }

        if ($now->gt($windowEnd)) {
            return 'ended';
        }

        return 'scheduled';
    }

    public function isJoinableNow(?Carbon $referenceTime = null): bool
    {
        if (! $this->is_active || $this->status === 'cancelled' || $this->status === 'ended') {
            return false;
        }

        return $this->computedStatus($referenceTime) === 'live';
    }

    public function toStudentArray(?Carbon $referenceTime = null): array
    {
        $computed = $this->computedStatus($referenceTime);
        $endsAt = $this->endsAt();

        return [
            'id' => $this->id,
            'scheduled_id' => $this->curso_programado_id,
            'course_id' => $this->curso_id,
            'module_id' => $this->module_id,
            'lesson_id' => $this->leccion_id,
            'title' => $this->title,
            'description' => $this->description,
            'scheduled_at_iso' => $this->scheduled_at?->toIso8601String(),
            'scheduled_date_iso' => $this->scheduled_at?->format('Y-m-d'),
            'scheduled_date_formatted' => $this->scheduled_at?->format('d/m/Y'),
            'scheduled_time_formatted' => $this->scheduled_at?->format('H:i'),
            'ends_time_formatted' => $endsAt->format('H:i'),
            'duration_minutes' => (int) $this->duration_minutes,
            'status' => $computed,
            'is_joinable' => $this->isJoinableNow($referenceTime),
            'room_url' => "/alumno/clases-en-vivo/{$this->id}/sala",
        ];
    }
}
