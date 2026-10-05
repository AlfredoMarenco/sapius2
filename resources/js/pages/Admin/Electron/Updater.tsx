import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Cpu, 
    Upload, 
    Download, 
    FileCode, 
    HardDrive, 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    Layers 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface UpdateFile {
    name: string;
    size: string;
    last_modified: string;
    url: string;
}

interface UpdaterProps {
    files: UpdateFile[];
    currentVersion: string;
}

export default function ElectronUpdater({ files = [], currentVersion = 'No registrada' }: UpdaterProps) {
    const [latestYml, setLatestYml] = useState<File | null>(null);
    const [installerExe, setInstallerExe] = useState<File | null>(null);
    const [blockmapFile, setBlockmapFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleUploadSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!latestYml && !installerExe && !blockmapFile) {
            alert('Por favor selecciona al menos un archivo para subir.');
            return;
        }

        const formData = new FormData();
        if (latestYml) formData.append('latest_yml', latestYml);
        if (installerExe) formData.append('installer_exe', installerExe);
        if (blockmapFile) formData.append('blockmap_file', blockmapFile);

        setIsUploading(true);
        router.post('/admin/electron/updater/upload', formData, {
            forceFormData: true,
            onFinish: () => {
                setIsUploading(false);
                setLatestYml(null);
                setInstallerExe(null);
                setBlockmapFile(null);
            },
        });
    };

    return (
        <>
            <Head title="Actualizador de Aplicación de Escritorio" />

            <div className="p-6 max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                            <Cpu className="w-8 h-8 text-blue-600" /> Servidor de Actualizaciones Electron
                        </h1>
                        <p className="text-sm text-neutral-500 mt-1">
                            Distribución de instaladores y parches automáticos para la aplicación de escritorio de Sapius.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 px-3.5 py-2 rounded-xl">
                        <span className="text-xs text-neutral-500">Versión Publicada:</span>
                        <Badge className="bg-blue-600 text-white font-mono text-xs">
                            v{currentVersion}
                        </Badge>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Col 1: Upload Form */}
                    <Card className="border-neutral-200/80 dark:border-neutral-800 shadow-sm md:col-span-1">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Upload className="w-4 h-4 text-blue-600" /> Publicar Nueva Versión
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Sube los artefactos generados por <code className="font-mono text-neutral-600">electron-builder</code>.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                                        1. Manifiesto <span className="font-mono text-blue-600">latest.yml</span>
                                    </Label>
                                    <input
                                        type="file"
                                        accept=".yml,.yaml"
                                        onChange={(e) => setLatestYml(e.target.files ? e.target.files[0] : null)}
                                        className="w-full text-xs text-neutral-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-neutral-800 dark:file:text-neutral-300 border border-neutral-200 dark:border-neutral-800 rounded-lg p-1.5"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                                        2. Instalador <span className="font-mono text-blue-600">.exe</span>
                                    </Label>
                                    <input
                                        type="file"
                                        accept=".exe"
                                        onChange={(e) => setInstallerExe(e.target.files ? e.target.files[0] : null)}
                                        className="w-full text-xs text-neutral-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-neutral-800 dark:file:text-neutral-300 border border-neutral-200 dark:border-neutral-800 rounded-lg p-1.5"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                                        3. Mapa de bloques <span className="font-mono text-blue-600">.blockmap</span>
                                    </Label>
                                    <input
                                        type="file"
                                        onChange={(e) => setBlockmapFile(e.target.files ? e.target.files[0] : null)}
                                        className="w-full text-xs text-neutral-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-neutral-800 dark:file:text-neutral-300 border border-neutral-200 dark:border-neutral-800 rounded-lg p-1.5"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isUploading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2 mt-2"
                                >
                                    <Upload className="w-4 h-4" />
                                    {isUploading ? 'Subiendo archivos...' : 'Subir y Desplegar Release'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Col 2: Active Files Table */}
                    <div className="md:col-span-2 space-y-4">
                        <Card className="border-neutral-200/80 dark:border-neutral-800 shadow-sm overflow-hidden">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <HardDrive className="w-4 h-4 text-emerald-600" /> Archivos en el Directorio de Actualizaciones
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Archivos alojados públicamente en <code className="font-mono">/public/updates/detector/</code> consumidos por las apps de los alumnos.
                                </CardDescription>
                            </CardHeader>
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-neutral-50/50 dark:bg-neutral-900/50">
                                        <TableHead>Nombre del Archivo</TableHead>
                                        <TableHead>Tamaño</TableHead>
                                        <TableHead>Última Modificación</TableHead>
                                        <TableHead className="text-right">Acción</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {files.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-10 text-neutral-400 text-sm">
                                                No hay archivos de actualización en el servidor.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        files.map((file, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell className="font-mono text-xs font-medium text-neutral-800 dark:text-neutral-200">
                                                    <div className="flex items-center gap-2">
                                                        <FileCode className="w-4 h-4 text-blue-500 shrink-0" />
                                                        <span className="truncate max-w-[220px]" title={file.name}>
                                                            {file.name}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-xs text-neutral-500 font-mono">
                                                    {file.size}
                                                </TableCell>
                                                <TableCell className="text-xs text-neutral-500">
                                                    {file.last_modified}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button asChild size="sm" variant="ghost" className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700">
                                                        <a href={file.url} download>
                                                            <Download className="w-3.5 h-3.5 mr-1" /> Descargar
                                                        </a>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </Card>

                        {/* Informative Note */}
                        <div className="p-4 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-xl text-xs text-blue-900 dark:text-blue-300 space-y-1">
                            <div className="font-semibold flex items-center gap-1.5">
                                <AlertCircle className="w-4 h-4 text-blue-600" />
                                Funcionamiento de la Actualización en Segundo Plano:
                            </div>
                            <p className="text-neutral-600 dark:text-neutral-400">
                                Al iniciar la aplicación de escritorio, el cliente consulta <code className="font-mono font-semibold">latest.yml</code>. Si detecta una versión superior a la local, descarga el instalador diferencial con el archivo <code className="font-mono">.blockmap</code> y aplica el parche automáticamente al cerrarse.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

ElectronUpdater.layout = (page: any) => (
    <AppLayout breadcrumbs={[
        { title: 'Panel de Control', href: '/admin' },
        { title: 'Actualizador Electron', href: '/admin/electron/updater' },
    ]}>
        {page}
    </AppLayout>
);
