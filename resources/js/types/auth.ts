export type User = {
    id: number;
    name: string;
    first_name: string;
    last_name: string;
    username: string | null;
    email: string;
    role: 'admin' | 'instructor' | 'student';
    avatar?: string;
    phone?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
