import { Form, Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import RecaptchaWidget from '@/components/recaptcha-widget';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import AuthLayout from '@/layouts/auth-layout';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    const { recaptcha_site_key } = usePage<any>().props;
    const [captchaToken, setCaptchaToken] = useState<string>('');
    const [captchaResetKey, setCaptchaResetKey] = useState(0);

    return (
        <>
            <Head title="Iniciar Sesión" />

            <div className="mb-6 text-center space-y-1">
                <h2 className="text-2xl font-black text-brand-navy tracking-tight">Bienvenido de nuevo</h2>
                <p className="text-xs font-semibold text-slate-500">Ingresa tus credenciales para acceder a la plataforma</p>
            </div>

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                onFinish={() => {
                    setCaptchaToken('');
                    setCaptchaResetKey((k) => k + 1);
                }}
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <input type="hidden" name="g-recaptcha-response" value={captchaToken} />

                        <div className="grid gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="username" className="text-xs font-bold text-slate-700 ml-0.5">
                                    Usuario o Correo Electrónico
                                </Label>
                                <Input
                                    id="username"
                                    type="text"
                                    name="username"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="username"
                                    placeholder="usuario o correo@ejemplo.com"
                                    className="h-12 border border-slate-200 rounded-xl px-4 text-sm font-medium focus-visible:ring-brand-coral focus-visible:border-brand-coral"
                                />
                                <InputError message={errors.username} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center justify-between ml-0.5">
                                    <Label htmlFor="password" title="Contraseña" className="text-xs font-bold text-slate-700">
                                        Contraseña
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="text-xs font-bold text-brand-coral hover:text-brand-coral/80 transition-colors"
                                            tabIndex={5}
                                        >
                                            ¿Olvidaste tu contraseña?
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    className="h-12 border border-slate-200 rounded-xl px-4 text-sm font-medium focus-visible:ring-brand-coral focus-visible:border-brand-coral"
                                />
                                <InputError message={errors.password} />
                            </div>

                            {recaptcha_site_key && (
                                <RecaptchaWidget
                                    siteKey={recaptcha_site_key}
                                    onVerify={(token) => setCaptchaToken(token)}
                                    onExpired={() => setCaptchaToken('')}
                                    resetKey={captchaResetKey}
                                    errorMessage={(errors as any)['g-recaptcha-response']}
                                />
                            )}

                            <div className="flex items-center space-x-2.5 ml-0.5">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="rounded border-slate-300 data-[state=checked]:bg-brand-coral data-[state=checked]:border-brand-coral"
                                />
                                <Label htmlFor="remember" className="text-xs font-medium text-slate-600 cursor-pointer select-none">
                                    Recordar mi sesión
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 h-12 rounded-xl bg-brand-coral hover:bg-brand-coral/90 text-white font-bold text-sm tracking-wide shadow-lg shadow-brand-coral/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing ? <Spinner className="mr-2" /> : null}
                                Iniciar Sesión
                            </Button>
                        </div>

                        {canRegister && (
                            <div className="text-center mt-3 pt-3 border-t border-slate-100">
                                <p className="text-xs text-slate-600">
                                    ¿Aún no tienes cuenta?{' '}
                                    <TextLink 
                                        href={register()} 
                                        tabIndex={5}
                                        className="text-brand-coral font-bold hover:underline ml-1"
                                    >
                                        Crear una cuenta
                                    </TextLink>
                                </p>
                            </div>
                        )}
                    </>
                )}
            </Form>

            {status && (
                <div className="mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-center text-xs font-bold text-emerald-700">
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = (page: any) => (
    <AuthLayout 
        title="Ingreso Sapius" 
        description="Plataforma de Alta Especialidad Médica"
        children={page} 
    />
);
