<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Tests\Concerns\CreatesLegacySchema;

uses(CreatesLegacySchema::class);

beforeEach(function () {
    $this->setUpLegacySchema();
    $this->seedLegacyRoles();
});

afterEach(function () {
    File::deleteDirectory(storage_path('app/chunks/qatestvideo'));
    @unlink(storage_path('app/uploads/qatestvideo.mp4'));
});

test('multi-chunk mp4 upload accepts intermediate chunks with non-video mime (QA-004)', function () {
    $admin = $this->assignLegacyRole(User::factory()->create(), 'admin');

    // Chunk 0: valid MP4 container header (ftyp box)
    $header = "\x00\x00\x00\x20ftypisom\x00\x00\x02\x00isomiso2avc1mp41".str_repeat("\x00", 4064);
    // Chunk 1: plain text bytes that finfo detects as text/plain (mid-stream video data)
    $middle = str_repeat('plain text payload that is not a video header ', 100);

    $chunk0 = UploadedFile::fake()->createWithContent('blob', $header);
    $chunk1 = UploadedFile::fake()->createWithContent('blob', $middle);

    $this->actingAs($admin)
        ->post('/admin/media/upload-chunk', [
            'file' => $chunk1,
            'index' => 1,
            'total_chunks' => 2,
            'identifier' => 'qatestvideo',
            'filename' => 'clase.mp4',
        ], ['Accept' => 'application/json'])
        ->assertOk()
        ->assertJsonPath('completed', false);

    $this->actingAs($admin)
        ->post('/admin/media/upload-chunk', [
            'file' => $chunk0,
            'index' => 0,
            'total_chunks' => 2,
            'identifier' => 'qatestvideo',
            'filename' => 'clase.mp4',
        ], ['Accept' => 'application/json'])
        ->assertOk()
        ->assertJsonPath('completed', true)
        ->assertJsonPath('filename', 'qatestvideo.mp4');
});

test('first chunk that is not an mp4 is still rejected', function () {
    $admin = $this->assignLegacyRole(User::factory()->create(), 'admin');

    $fake = UploadedFile::fake()->createWithContent('blob', str_repeat('not a video at all ', 200));

    $this->actingAs($admin)
        ->post('/admin/media/upload-chunk', [
            'file' => $fake,
            'index' => 0,
            'total_chunks' => 3,
            'identifier' => 'qatestvideo',
            'filename' => 'clase.mp4',
        ], ['Accept' => 'application/json'])
        ->assertStatus(422)
        ->assertJsonPath('error', 'Tipo MIME no permitido para video MP4.');
});
