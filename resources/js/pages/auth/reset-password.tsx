import { Form, Head } from '@inertiajs/react';
import type { ReactNode } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { update } from '@/routes/password';

type Props = {
    token: string;
    email: string;
};

export default function ResetPassword({ token, email }: Props) {
    return (
        <>
            <Head title="Restablecer contraseña" />

            <div className="mb-6 space-y-1 text-center">
                <h2 className="text-2xl font-black tracking-tight text-brand-navy uppercase">
                    Nueva contraseña
                </h2>
                <p className="text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase italic">
                    Define tus nuevas credenciales de acceso
                </p>
            </div>

            <Form
                {...update.form()}
                transform={(data) => ({ ...data, token, email })}
                resetOnSuccess={['password', 'password_confirmation']}
            >
                {({ processing, errors }) => (
                    <div className="grid gap-5">
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
                                autoComplete="email"
                                value={email}
                                className="mt-1 block h-12 w-full rounded-2xl border-2 bg-neutral-50 px-4 font-medium"
                                readOnly
                            />
                            <InputError
                                message={errors.email}
                                className="mt-1"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label
                                htmlFor="password"
                                className="ml-1 text-[10px] font-black tracking-widest text-brand-navy/60 uppercase"
                            >
                                Contraseña nueva
                            </Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                autoComplete="new-password"
                                className="mt-1 block h-12 w-full rounded-2xl border-2 px-4 font-medium focus-visible:border-brand-navy focus-visible:ring-brand-navy"
                                autoFocus
                                placeholder="••••••••"
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label
                                htmlFor="password_confirmation"
                                className="ml-1 text-[10px] font-black tracking-widest text-brand-navy/60 uppercase"
                            >
                                Confirmar contraseña
                            </Label>
                            <PasswordInput
                                id="password_confirmation"
                                name="password_confirmation"
                                autoComplete="new-password"
                                className="mt-1 block h-12 w-full rounded-2xl border-2 px-4 font-medium focus-visible:border-brand-navy focus-visible:ring-brand-navy"
                                placeholder="••••••••"
                            />
                            <InputError
                                message={errors.password_confirmation}
                                className="mt-1"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="mt-2 h-12 w-full rounded-2xl bg-brand-navy text-xs font-black tracking-widest uppercase shadow-xl shadow-brand-navy/20 hover:bg-brand-navy/90"
                            disabled={processing}
                            data-test="reset-password-button"
                        >
                            {processing && <Spinner className="mr-2" />}
                            Restablecer contraseña
                        </Button>
                    </div>
                )}
            </Form>
        </>
    );
}

ResetPassword.layout = (page: ReactNode) => (
    <AuthLayout
        title="Restablecer contraseña"
        description="Ingresa tu nueva contraseña para acceder a Sapius"
    >
        {page}
    </AuthLayout>
);
