<?php

namespace App\Traits;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
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

        // Leemos la imagen temporal subida
        $image = $manager->read($file->getRealPath());

        // Si la imagen es extremadamente grande, la redimensionamos para no exceder Full HD
        // Esto mantiene la relación de aspecto automáticamente en v3
        $image->scaleDown(width: 1920, height: 1920);

        // Convertimos a WebP
        $encoded = $image->toWebp($quality);

        // Generamos un nombre único seguro
        $filename = Str::random(40) . '.webp';
        
        // Limpiamos los slashes de la carpeta
        $path = trim($folder, '/') . '/' . $filename;

        // Guardamos en el disco público (storage/app/public)
        Storage::disk('public')->put($path, (string) $encoded);

        return $path;
    }
}
