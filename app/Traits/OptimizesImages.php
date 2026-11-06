<?php

namespace App\Traits;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

trait OptimizesImages
{
    /**
     * Optimiza y guarda una imagen subida en formato WebP (o almacenamiento estándar seguro como fallback).
     *
     * @param UploadedFile $file El archivo subido
     * @param string $folder La carpeta de destino dentro del disco publico (ej. 'courses')
     * @param int $quality Nivel de calidad para WebP (0-100)
     * @return string La ruta donde se guardó la imagen
     */
    protected function optimizeAndStoreImage(UploadedFile $file, string $folder, int $quality = 80): string
    {
        $folderPath = trim($folder, '/');

        // Si la librería Intervention Image está instalada y disponible en el entorno
        if (class_exists(\Intervention\Image\ImageManager::class)) {
            try {
                if (class_exists(\Intervention\Image\Drivers\Gd\Driver::class)) {
                    $manager = new \Intervention\Image\ImageManager(new \Intervention\Image\Drivers\Gd\Driver());
                } else {
                    $manager = new \Intervention\Image\ImageManager();
                }

                if (method_exists($manager, 'decode')) {
                    $image = $manager->decode($file->getRealPath());
                } elseif (method_exists($manager, 'read')) {
                    $image = $manager->read($file->getRealPath());
                } else {
                    $image = $manager->make($file->getRealPath());
                }

                if (method_exists($image, 'scaleDown')) {
                    $image->scaleDown(width: 1920, height: 1920);
                }

                if (method_exists($image, 'toWebp')) {
                    $encoded = $image->toWebp($quality);
                } elseif (class_exists(\Intervention\Image\Encoders\WebpEncoder::class)) {
                    $encoded = $image->encode(new \Intervention\Image\Encoders\WebpEncoder(quality: $quality));
                } else {
                    $encoded = $image->encode('webp', $quality);
                }

                $filename = Str::random(40) . '.webp';
                $path = $folderPath . '/' . $filename;
                Storage::disk('public')->put($path, (string) $encoded);

                return $path;
            } catch (\Throwable $e) {
                \Log::warning("Error optimizando imagen con Intervention: {$e->getMessage()}. Procediendo con almacenamiento estándar.");
            }
        }

        // Fallback nativo: Si no está Intervention Image o falla, procesar con GD o almacenar de forma nativa
        if (function_exists('imagecreatefromstring') && function_exists('imagewebp')) {
            try {
                $contents = file_get_contents($file->getRealPath());
                $src = @imagecreatefromstring($contents);
                if ($src !== false) {
                    $width = imagesx($src);
                    $height = imagesy($src);

                    // Redimensionar si supera 1920px
                    $maxWidth = 1920;
                    $maxHeight = 1920;
                    if ($width > $maxWidth || $height > $maxHeight) {
                        $ratio = min($maxWidth / $width, $maxHeight / $height);
                        $newWidth = (int) round($width * $ratio);
                        $newHeight = (int) round($height * $ratio);

                        $dest = imagecreatetruecolor($newWidth, $newHeight);
                        imagealphablending($dest, false);
                        imagesavealpha($dest, true);
                        imagecopyresampled($dest, $src, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
                        imagedestroy($src);
                        $src = $dest;
                    }

                    ob_start();
                    imagewebp($src, null, $quality);
                    $webpData = ob_get_clean();
                    imagedestroy($src);

                    if ($webpData) {
                        $filename = Str::random(40) . '.webp';
                        $path = $folderPath . '/' . $filename;
                        Storage::disk('public')->put($path, $webpData);
                        return $path;
                    }
                }
            } catch (\Throwable $e) {
                \Log::warning("Error optimizando imagen con GD nativo: {$e->getMessage()}. Procediendo con almacenamiento directo.");
            }
        }

        // Último fallback estándar de Laravel si GD no procesa la imagen
        $extension = $file->getClientOriginalExtension() ?: 'png';
        $filename = Str::random(40) . '.' . $extension;
        $path = $folderPath . '/' . $filename;
        Storage::disk('public')->putFileAs($folderPath, $file, $filename);

        return $path;
    }
}
