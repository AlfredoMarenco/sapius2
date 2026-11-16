<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;

class ElectronUpdaterController extends Controller
{
    /**
     * Display current desktop app update files and version
     * Legacy URL: GET /admin/electron/updater
     */
    public function index()
    {
        $updateDir = public_path('updates/detector');

        if (! File::exists($updateDir)) {
            File::makeDirectory($updateDir, 0755, true);
        }

        $files = [];
        $currentVersion = 'No registrada';

        $latestYmlPath = $updateDir.'/latest.yml';
        if (File::exists($latestYmlPath)) {
            $ymlContent = File::get($latestYmlPath);
            if (preg_match('/version:\s*([^\s\n]+)/', $ymlContent, $matches)) {
                $currentVersion = $matches[1];
            }
        }

        $dirFiles = File::files($updateDir);
        foreach ($dirFiles as $file) {
            $files[] = [
                'name' => $file->getFilename(),
                'size' => $this->formatBytes($file->getSize()),
                'last_modified' => date('d/m/Y H:i:s', $file->getMTime()),
                'url' => asset('updates/detector/'.$file->getFilename()),
            ];
        }

        return Inertia::render('Admin/Electron/Updater', [
            'files' => $files,
            'currentVersion' => $currentVersion,
        ]);
    }

    /**
     * Upload and release a new version of the desktop app
     * Legacy URL: POST /admin/electron/updater/upload
     */
    public function upload(Request $request)
    {
        $request->validate([
            'latest_yml' => 'nullable|file|max:1024',
            'installer_exe' => 'nullable|file|max:512000',
            'blockmap_file' => 'nullable|file|max:102400',
        ]);

        $updateDir = public_path('updates/detector');

        if (! File::exists($updateDir)) {
            File::makeDirectory($updateDir, 0755, true);
        }

        $exeFile = $request->file('installer_exe');
        $blockmapFile = $request->file('blockmap_file');
        $ymlFile = $request->file('latest_yml');

        if (! $exeFile && ! $blockmapFile && ! $ymlFile) {
            return redirect()->back()->with('error', 'No se seleccionó ningún archivo para subir.');
        }

        // Validación previa de nombres y extensiones exactas antes de mover archivos
        $safeExeName = null;
        if ($exeFile) {
            $safeExeName = $this->sanitizeReleaseFilename($exeFile->getClientOriginalName());
            if ($safeExeName === '' || strtolower(pathinfo($safeExeName, PATHINFO_EXTENSION)) !== 'exe') {
                return redirect()->back()->with('error', 'El instalador debe ser un archivo ejecutable válido (.exe).');
            }
        }

        $safeBlockmapName = null;
        if ($blockmapFile) {
            $safeBlockmapName = $this->sanitizeReleaseFilename($blockmapFile->getClientOriginalName());
            if ($safeBlockmapName === '' || strtolower(pathinfo($safeBlockmapName, PATHINFO_EXTENSION)) !== 'blockmap') {
                return redirect()->back()->with('error', 'El archivo blockmap debe tener extensión final exacta .blockmap.');
            }
        }

        if ($ymlFile) {
            $safeYmlName = $this->sanitizeReleaseFilename($ymlFile->getClientOriginalName());
            if (strtolower($safeYmlName) !== 'latest.yml' || strtolower(pathinfo($safeYmlName, PATHINFO_EXTENSION)) !== 'yml') {
                return redirect()->back()->with('error', 'El archivo latest.yml debe llamarse exactamente "latest.yml".');
            }
        }

        $uploadedCount = 0;

        // 1. Mover primero el instalador .exe
        if ($exeFile && $safeExeName) {
            $exeFile->move($updateDir, $safeExeName);
            $uploadedCount++;
        }

        // 2. Mover el archivo .blockmap
        if ($blockmapFile && $safeBlockmapName) {
            $blockmapFile->move($updateDir, $safeBlockmapName);
            $uploadedCount++;
        }

        // 3. Validar latest.yml (referencia a path:) y moverlo al final antes de limpiar versiones antiguas
        if ($ymlFile) {
            $ymlContent = File::get($ymlFile->getRealPath());
            $referencedPath = null;
            if (preg_match('/^path:\s*(.+)$/m', $ymlContent, $pathMatches)) {
                $referencedPath = $this->sanitizeReleaseFilename(trim($pathMatches[1], " \t\n\r\0\x0B'\""));
            }

            if (! $referencedPath || ! File::exists($updateDir.DIRECTORY_SEPARATOR.$referencedPath)) {
                return redirect()->back()->with('error', 'El archivo referenciado en "path:" dentro de latest.yml no existe en el servidor.');
            }

            $ymlFile->move($updateDir, 'latest.yml');
            $uploadedCount++;

            $newVersion = null;
            if (preg_match('/^version:\s*([^\s\n]+)/m', $ymlContent, $matches)) {
                $newVersion = trim($matches[1]);
            }

            $keepFiles = array_filter([
                'latest.yml',
                $referencedPath,
                $referencedPath.'.blockmap',
                $safeExeName,
                $safeBlockmapName,
            ]);

            foreach (File::files($updateDir) as $existingFile) {
                $filename = $existingFile->getFilename();
                if (in_array($filename, $keepFiles, true)) {
                    continue;
                }
                if ($newVersion && str_contains($filename, $newVersion)) {
                    continue;
                }
                File::delete($existingFile->getRealPath());
            }
        }

        return redirect()->back()->with('success', "Se subieron {$uploadedCount} archivos de actualización con éxito.");
    }

    private function sanitizeReleaseFilename(string $originalName): string
    {
        $base = basename($originalName);
        if (str_contains($base, '..') || str_contains($base, "\0")) {
            return '';
        }

        $sanitized = preg_replace('/[^a-zA-Z0-9._ \-]/', '', $base);

        return ltrim(trim((string) $sanitized), '.');
    }

    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);

        return round($bytes, $precision).' '.$units[$pow];
    }
}
