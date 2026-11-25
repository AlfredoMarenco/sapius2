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
            <Head title="Iniciar Sesión | Sapius" />

            <div className="mb-6 space-y-1">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101E33] tracking-tight">Iniciar Sesión</h2>
                <p className="text-sm font-medium text-slate-500">
                    Ingresa tus credenciales para acceder a tus cursos y materiales.
                </p>
            </div>

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                onFinish={() => {
                    setCaptchaToken('');
                    setCaptchaResetKey((k) => k + 1);
                }}
                className="flex flex-col gap-4"
            >
                {({ processing, errors }) => (
                    <>
                        <input type="hidden" name="g-recaptcha-response" value={captchaToken} />

                        <div className="grid gap-4">
                            <div className="grid gap-1.5">
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
                                    placeholder="ejemplo@correo.com o tu_usuario"
                                    className="h-11 border border-slate-200 rounded-xl px-3.5 text-sm font-medium focus-visible:ring-[#FF6B52] focus-visible:border-[#FF6B52]"
                                />
                                <InputError message={errors.username} />
                            </div>

                            <div className="grid gap-1.5">
                                <div className="flex items-center justify-between ml-0.5">
                                    <Label htmlFor="password" title="Contraseña" className="text-xs font-bold text-slate-700">
                                        Contraseña
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="text-xs font-bold text-[#FF6B52] hover:text-[#e0553e] transition-colors"
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
                                    className="h-11 border border-slate-200 rounded-xl px-3.5 text-sm font-medium focus-visible:ring-[#FF6B52] focus-visible:border-[#FF6B52]"
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
                                    className="rounded border-slate-300 data-[state=checked]:bg-[#FF6B52] data-[state=checked]:border-[#FF6B52]"
                                />
                                <Label htmlFor="remember" className="text-xs font-medium text-slate-600 cursor-pointer select-none">
                                    Recordar mi sesión
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 h-11 rounded-xl bg-[#FF6B52] hover:bg-[#e0553e] text-white font-bold text-sm tracking-wide shadow-md shadow-[#FF6B52]/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing ? <Spinner className="mr-2" /> : null}
                                Entrar a mi Cuenta
                            </Button>
                        </div>

                        {canRegister && (
                            <div className="text-center mt-3 pt-4 border-t border-slate-100">
                                <p className="text-xs text-slate-600">
                                    ¿Aún no tienes cuenta?{' '}
                                    <TextLink 
                                        href={register()} 
                                        tabIndex={5}
                                        className="text-[#FF6B52] font-bold hover:underline ml-1"
                                    >
                                        Crear una cuenta nueva
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
