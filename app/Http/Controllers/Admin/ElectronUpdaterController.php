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

        if (!File::exists($updateDir)) {
            File::makeDirectory($updateDir, 0755, true);
        }

        $files = [];
        $currentVersion = 'No registrada';

        $latestYmlPath = $updateDir . '/latest.yml';
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
                'url' => asset('updates/detector/' . $file->getFilename()),
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
            'latest_yml' => 'nullable|file',
            'installer_exe' => 'nullable|file',
            'blockmap_file' => 'nullable|file',
        ]);

        $updateDir = public_path('updates/detector');

        if (!File::exists($updateDir)) {
            File::makeDirectory($updateDir, 0755, true);
        }

        $uploadedCount = 0;

        // 1. Guardar latest.yml
        if ($request->hasFile('latest_yml')) {
            $file = $request->file('latest_yml');
            if ($file->getClientOriginalName() === 'latest.yml' || $file->getClientOriginalExtension() === 'yml') {
                try {
                    $ymlContent = File::get($file->getRealPath());
                    if (preg_match('/version:\s*([^\s\n]+)/', $ymlContent, $matches)) {
                        $newVersion = $matches[1];
                        if ($newVersion) {
                            $dirFiles = File::files($updateDir);
                            foreach ($dirFiles as $existingFile) {
                                $filename = $existingFile->getFilename();
                                if ($filename !== 'latest.yml' && strpos($filename, $newVersion) === false) {
                                    File::delete($existingFile->getRealPath());
                                }
                            }
                        }
                    }
                } catch (\Exception $e) {
                    // Continuar si falla la lectura de versión previa
                }

                $file->move($updateDir, 'latest.yml');
                $uploadedCount++;
            } else {
                return redirect()->back()->with('error', 'El archivo latest.yml debe llamarse exactamente "latest.yml".');
            }
        }

        // 2. Guardar instalador .exe
        if ($request->hasFile('installer_exe')) {
            $file = $request->file('installer_exe');
            if (strtolower($file->getClientOriginalExtension()) === 'exe') {
                $file->move($updateDir, $file->getClientOriginalName());
                $uploadedCount++;
            } else {
                return redirect()->back()->with('error', 'El instalador debe ser un archivo ejecutable (.exe).');
            }
        }

        // 3. Guardar archivo .blockmap
        if ($request->hasFile('blockmap_file')) {
            $file = $request->file('blockmap_file');
            if (str_contains($file->getClientOriginalName(), '.blockmap')) {
                $file->move($updateDir, $file->getClientOriginalName());
                $uploadedCount++;
            } else {
                return redirect()->back()->with('error', 'El archivo blockmap debe contener la extensión .blockmap.');
            }
        }

        if ($uploadedCount > 0) {
            return redirect()->back()->with('success', "Se subieron {$uploadedCount} archivos de actualización con éxito.");
        }

        return redirect()->back()->with('error', 'No se seleccionó ningún archivo para subir.');
    }

    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);
        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}
