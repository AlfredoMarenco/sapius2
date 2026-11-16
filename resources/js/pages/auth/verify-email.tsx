import { Form, Head } from '@inertiajs/react';
import type { ReactNode } from 'react';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { logout } from '@/routes';
import { send } from '@/routes/verification';

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <>
            <Head title="Verificación de correo" />

            <div className="mb-6 space-y-2 text-center">
                <h2 className="text-2xl font-black tracking-tight text-brand-navy uppercase">
                    Verifica tu correo
                </h2>
                <p className="text-xs leading-relaxed text-muted-foreground">
                    Por favor verifica tu dirección de correo electrónico haciendo clic en el enlace que te acabamos de enviar.
                </p>
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-center text-xs font-bold text-emerald-700">
                    Hemos enviado un nuevo enlace de verificación a la dirección de correo que registraste.
                </div>
            )}

            <Form {...send.form()} className="space-y-6 text-center">
                {({ processing }) => (
                    <>
                        <Button
                            disabled={processing}
                            variant="secondary"
                            className="h-12 w-full rounded-2xl bg-brand-navy text-xs font-black tracking-widest text-white uppercase shadow-xl shadow-brand-navy/20 hover:bg-brand-navy/90"
                        >
                            {processing && <Spinner className="mr-2" />}
                            Reenviar correo de verificación
                        </Button>

                        <TextLink
                            href={logout()}
                            className="mx-auto block text-xs font-bold text-muted-foreground hover:text-brand-navy"
                        >
                            Cerrar sesión
                        </TextLink>
                    </>
                )}
            </Form>
        </>
    );
}

VerifyEmail.layout = (page: ReactNode) => (
    <AuthLayout
        title="Verifica tu correo"
        description="Confirma tu cuenta para acceder a la plataforma Sapius"
    >
        {page}
    </AuthLayout>
);
