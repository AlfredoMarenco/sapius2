import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
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
    return (
        <>
            <Head title="Acceso de Usuario" />

            <div className="mb-8 text-center space-y-1">
                <h2 className="text-2xl font-black text-brand-navy tracking-tight uppercase">Bienvenido</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground italic">Ingresa a tu cuenta de usuario</p>
            </div>

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-brand-navy/60 ml-1">Correo Electrónico</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="admin@sapius.com"
                                    className="h-14 border-2 rounded-2xl px-5 font-bold focus-visible:ring-brand-navy focus-visible:border-brand-navy"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center ml-1">
                                    <Label htmlFor="password" title="Contraseña" className="text-[10px] font-black uppercase tracking-widest text-brand-navy/60">Contraseña</Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-[9px] font-black uppercase tracking-widest text-brand-coral hover:text-brand-coral/80"
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
                                    className="h-14 border-2 rounded-2xl px-5 font-bold focus-visible:ring-brand-navy focus-visible:border-brand-navy"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3 ml-1">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="rounded-md border-2 border-brand-navy/20 data-[state=checked]:bg-brand-navy data-[state=checked]:border-brand-navy"
                                />
                                <Label htmlFor="remember" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Recordar mi sesión</Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 h-14 rounded-2xl bg-brand-navy hover:bg-brand-navy/90 font-black uppercase tracking-widest text-xs shadow-xl shadow-brand-navy/20"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing ? <Spinner className="mr-2" /> : null}
                                Entrar al Panel
                            </Button>
                        </div>

                        {canRegister && (
                            <div className="text-center mt-4">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                    ¿Aún no tienes cuenta?{' '}
                                    <TextLink 
                                        href={register()} 
                                        tabIndex={5}
                                        className="text-brand-blue font-black hover:underline ml-1"
                                    >
                                        Regístrate aquí
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
