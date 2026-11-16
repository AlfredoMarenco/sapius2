import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <>
            <Head title="Recuperar contraseña" />

            <div className="mb-6 space-y-1 text-center">
                <h2 className="text-2xl font-black tracking-tight text-brand-navy uppercase">
                    ¿Olvidaste tu contraseña?
                </h2>
                <p className="text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase italic">
                    Te enviaremos un enlace para restablecerla
                </p>
            </div>

            {status && (
                <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-center text-xs font-bold text-emerald-700">
                    {status}
                </div>
            )}

            <div className="space-y-6">
                <Form {...email.form()}>
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="email"
                                    className="ml-1 text-[10px] font-black tracking-widest text-brand-navy/60 uppercase"
                                >
                                    Correo electrónico
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoComplete="off"
                                    autoFocus
                                    placeholder="correo@ejemplo.com"
                                    className="h-12 rounded-2xl border-2 px-4 font-medium focus-visible:border-brand-navy focus-visible:ring-brand-navy"
                                />

                                <InputError message={errors.email} />
                            </div>

                            <div className="my-6 flex items-center justify-start">
                                <Button
                                    className="h-12 w-full rounded-2xl bg-brand-navy text-xs font-black tracking-widest uppercase shadow-xl shadow-brand-navy/20 hover:bg-brand-navy/90"
                                    disabled={processing}
                                    data-test="email-password-reset-link-button"
                                >
                                    {processing && (
                                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Enviar enlace de recuperación
                                </Button>
                            </div>
                        </>
                    )}
                </Form>

                <div className="space-x-1 text-center text-xs font-bold text-muted-foreground">
                    <span>O regresa a</span>
                    <TextLink
                        href={login()}
                        className="font-black text-brand-blue hover:underline"
                    >
                        iniciar sesión
                    </TextLink>
                </div>
            </div>
        </>
    );
}

ForgotPassword.layout = (page: ReactNode) => (
    <AuthLayout
        title="Recuperar contraseña"
        description="Ingresa tu correo electrónico para restablecer tu acceso"
    >
        {page}
    </AuthLayout>
);
