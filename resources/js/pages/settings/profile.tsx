import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import { UserCheck, ArrowRight } from 'lucide-react';

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<any>().props;
    const userRole = auth?.user?.role?.toLowerCase();
    const isStudent = !userRole || userRole === 'alumno';

    return (
        <>
            <Head title="Configuración de Perfil" />

            <h1 className="sr-only">Configuración de Perfil</h1>

            <div className="space-y-8">
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Información de Perfil"
                        description="Actualiza tu nombre y dirección de correo electrónico"
                    />

                    <Form
                        {...ProfileController.update.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        className="space-y-6"
                    >
                        {({ processing, recentlySuccessful, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nombre completo</Label>

                                    <Input
                                        id="name"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.name}
                                        name="name"
                                        required
                                        autoComplete="name"
                                        placeholder="Nombre completo"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.name}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Correo electrónico</Label>

                                    <Input
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.email}
                                        name="email"
                                        required
                                        autoComplete="username"
                                        placeholder="Correo electrónico"
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.email}
                                    />
                                </div>

                                {mustVerifyEmail &&
                                    auth.user.email_verified_at === null && (
                                        <div>
                                            <p className="-mt-4 text-sm text-muted-foreground">
                                                Tu dirección de correo electrónico no ha sido verificada.{' '}
                                                <Link
                                                    href={send()}
                                                    as="button"
                                                    className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                                >
                                                    Haz clic aquí para reenviar el correo de verificación.
                                                </Link>
                                            </p>

                                            {status ===
                                                'verification-link-sent' && (
                                                <div className="mt-2 text-sm font-medium text-green-600">
                                                    Se ha enviado un nuevo enlace de verificación a tu correo electrónico.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                <div className="flex items-center gap-4">
                                    <Button
                                        disabled={processing}
                                        data-test="update-profile-button"
                                    >
                                        Guardar cambios
                                    </Button>

                                    <Transition
                                        show={recentlySuccessful}
                                        enter="transition ease-in-out"
                                        enterFrom="opacity-0"
                                        leave="transition ease-in-out"
                                        leaveTo="opacity-0"
                                    >
                                        <p className="text-sm text-emerald-600 font-medium">
                                            Guardado correctamente
                                        </p>
                                    </Transition>
                                </div>
                            </>
                        )}
                    </Form>
                </div>

                {isStudent && (
                    <Card className="border-blue-100 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 shadow-xs">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-bold flex items-center gap-2 text-blue-950 dark:text-blue-100">
                                <UserCheck className="w-5 h-5 text-blue-600" />
                                Expediente Académico del Alumno
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Completa o actualiza tu teléfono, universidad de procedencia, folio CENEVAL y fecha programada de examen.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild variant="outline" size="sm" className="bg-white dark:bg-neutral-900 border-blue-200 text-blue-700 hover:bg-blue-50">
                                <Link href="/alumno/users/alumno/complete">
                                    Completar datos académicos <ArrowRight className="w-4 h-4 ml-1.5" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

Profile.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'Configuración de Perfil', href: edit() }]}>
        <SettingsLayout>{page}</SettingsLayout>
    </AppLayout>
);
