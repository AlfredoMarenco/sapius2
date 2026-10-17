<?php

namespace App\Traits;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Encoders\WebpEncoder;
use Illuminate\Support\Str;

trait OptimizesImages
{
    /**
     * Optimiza y guarda una imagen subida en formato WebP usando Intervention Image.
     *
     * @param UploadedFile $file El archivo subido
     * @param string $folder La carpeta de destino dentro del disco publico (ej. 'courses')
     * @param int $quality Nivel de calidad para WebP (0-100)
     * @return string La ruta donde se guardó la imagen
     */
    protected function optimizeAndStoreImage(UploadedFile $file, string $folder, int $quality = 80): string
    {
        // Usamos el driver GD
        $manager = new ImageManager(new Driver());

        // Leemos la imagen temporal subida (soporta v4 con decode y v3 con read)
        if (method_exists($manager, 'decode')) {
            $image = $manager->decode($file->getRealPath());
        } elseif (method_exists($manager, 'read')) {
            $image = $manager->read($file->getRealPath());
        } else {
            $image = $manager->make($file->getRealPath());
        }

        // Si la imagen es extremadamente grande, la redimensionamos para no exceder Full HD
        if (method_exists($image, 'scaleDown')) {
            $image->scaleDown(width: 1920, height: 1920);
        }

        // Convertimos a WebP (soporta v4 con WebpEncoder y v3 con toWebp)
        if (method_exists($image, 'toWebp')) {
            $encoded = $image->toWebp($quality);
        } else {
            $encoded = $image->encode(new WebpEncoder(quality: $quality));
        }

        // Generamos un nombre único seguro
        $filename = Str::random(40) . '.webp';
        
        // Limpiamos los slashes de la carpeta
        $path = trim($folder, '/') . '/' . $filename;

        // Guardamos en el disco público (storage/app/public)
        Storage::disk('public')->put($path, (string) $encoded);

        return $path;
    }
}
