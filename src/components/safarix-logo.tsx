// Safarix AI — Uses the favicon.png from public/ folder as the logo
export function SafarixLogo({ size = 32 }: { size?: number }) {
    return (
        <img
            src="/favicon.png"
            alt="Safarix AI logo"
            width={size}
            height={size}
            style={{ objectFit: "contain", display: "block" }}
        />
    );
}
