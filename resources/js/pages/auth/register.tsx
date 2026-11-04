import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';
import AuthLayout from '@/layouts/auth-layout';

export default function Register() {
    return (
        <>
            <Head title="Registro de Alumno" />

            <div className="mb-8 text-center space-y-1">
                <h2 className="text-2xl font-black text-brand-navy tracking-tight uppercase">Crear Cuenta</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground italic">Regístrate para acceder a tus cursos y simuladores</p>
            </div>

            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="first_name" className="text-[10px] font-black uppercase tracking-widest text-brand-navy/60 ml-1">Nombre</Label>
                                    <Input
                                        id="first_name"
                                        type="text"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="given-name"
                                        name="first_name"
                                        placeholder="Tu nombre"
                                        className="h-12 border-2 rounded-2xl px-4 font-medium focus-visible:ring-brand-navy focus-visible:border-brand-navy"
                                    />
                                    <InputError message={errors.first_name || errors.name} />
                                </div>

                                <div className="grid gap-1.5">
                                    <Label htmlFor="last_name" className="text-[10px] font-black uppercase tracking-widest text-brand-navy/60 ml-1">Apellidos</Label>
                                    <Input
                                        id="last_name"
                                        type="text"
                                        required
                                        tabIndex={2}
                                        autoComplete="family-name"
                                        name="last_name"
                                        placeholder="Tus apellidos"
                                        className="h-12 border-2 rounded-2xl px-4 font-medium focus-visible:ring-brand-navy focus-visible:border-brand-navy"
                                    />
                                    <InputError message={errors.last_name} />
                                </div>
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="username" className="text-[10px] font-black uppercase tracking-widest text-brand-navy/60 ml-1">Nombre de Usuario</Label>
                                <Input
                                    id="username"
                                    type="text"
                                    required
                                    tabIndex={3}
                                    autoComplete="username"
                                    name="username"
                                    placeholder="Ej: juan.perez"
                                    className="h-12 border-2 rounded-2xl px-4 font-medium focus-visible:ring-brand-navy focus-visible:border-brand-navy"
                                />
                                <InputError message={errors.username} />
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-brand-navy/60 ml-1">Correo Electrónico</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={4}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="correo@ejemplo.com"
                                    className="h-12 border-2 rounded-2xl px-4 font-medium focus-visible:ring-brand-navy focus-visible:border-brand-navy"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-brand-navy/60 ml-1">Contraseña</Label>
                                    <PasswordInput
                                        id="password"
                                        required
                                        tabIndex={5}
                                        autoComplete="new-password"
                                        name="password"
                                        placeholder="••••••••"
                                        className="h-12 border-2 rounded-2xl px-4 font-medium focus-visible:ring-brand-navy focus-visible:border-brand-navy"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="grid gap-1.5">
                                    <Label htmlFor="password_confirmation" className="text-[10px] font-black uppercase tracking-widest text-brand-navy/60 ml-1">Confirmar</Label>
                                    <PasswordInput
                                        id="password_confirmation"
                                        required
                                        tabIndex={6}
                                        autoComplete="new-password"
                                        name="password_confirmation"
                                        placeholder="••••••••"
                                        className="h-12 border-2 rounded-2xl px-4 font-medium focus-visible:ring-brand-navy focus-visible:border-brand-navy"
                                    />
                                    <InputError message={errors.password_confirmation} />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 h-14 rounded-2xl bg-brand-navy hover:bg-brand-navy/90 font-black uppercase tracking-widest text-xs shadow-xl shadow-brand-navy/20"
                                tabIndex={7}
                                disabled={processing}
                                data-test="register-user-button"
                            >
                                {processing ? <Spinner className="mr-2" /> : null}
                                Crear Mi Cuenta
                            </Button>
                        </div>

                        <div className="text-center mt-2">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                ¿Ya tienes una cuenta?{' '}
                                <TextLink href={login()} tabIndex={8} className="text-brand-blue font-black hover:underline ml-1">
                                    Inicia sesión aquí
                                </TextLink>
                            </p>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = (page: any) => (
    <AuthLayout 
        title="Registro Sapius" 
        description="Plataforma de Alta Especialidad Médica"
        children={page} 
    />
);
