import { Form, Head } from '@inertiajs/react';
import type { ReactNode } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { store } from '@/routes/password/confirm';

export default function ConfirmPassword() {
    return (
        <>
            <Head title="Confirmar contraseña" />

            <div className="mb-6 space-y-2 text-center">
                <h2 className="text-2xl font-black tracking-tight text-brand-navy uppercase">
                    Confirmar acceso
                </h2>
                <p className="text-xs leading-relaxed text-muted-foreground">
                    Esta es un área segura de la plataforma. Ingresa tu contraseña antes de continuar.
                </p>
            </div>

            <Form {...store.form()} resetOnSuccess={['password']}>
                {({ processing, errors }) => (
                    <div className="space-y-6">
                        <div className="grid gap-2">
                            <Label
                                htmlFor="password"
                                className="ml-1 text-[10px] font-black tracking-widest text-brand-navy/60 uppercase"
                            >
                                Contraseña
                            </Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                placeholder="••••••••"
                                autoComplete="current-password"
                                autoFocus
                                className="h-12 rounded-2xl border-2 px-4 font-medium focus-visible:border-brand-navy focus-visible:ring-brand-navy"
                            />

                            <InputError message={errors.password} />
                        </div>

                        <div className="flex items-center">
                            <Button
                                className="h-12 w-full rounded-2xl bg-brand-navy text-xs font-black tracking-widest uppercase shadow-xl shadow-brand-navy/20 hover:bg-brand-navy/90"
                                disabled={processing}
                                data-test="confirm-password-button"
                            >
                                {processing && <Spinner className="mr-2" />}
                                Confirmar contraseña
                            </Button>
                        </div>
                    </div>
                )}
            </Form>
        </>
    );
}

ConfirmPassword.layout = (page: ReactNode) => (
    <AuthLayout
        title="Confirmar contraseña"
        description="Área segura de verificación de identidad"
    >
        {page}
    </AuthLayout>
);
