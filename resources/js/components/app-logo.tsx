export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-transparent">
                <img src="/img/brand/logo.png" alt="Sapius Logo" className="size-8 object-contain" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-black text-lg tracking-tight text-white">
                    Sapius<span className="text-brand-orange">2</span>
                </span>
            </div>
        </>
    );
}
