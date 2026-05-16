export default function StatusBanner({
  message,
  tone = 'auto',
}: {
  message: string;
  tone?: 'auto' | 'info';
}) {
  if (!message) return null;

  const isError =
    tone === 'auto' &&
    !message.startsWith('✓') &&
    !message.startsWith('⏳');

  const toneClasses = isError
    ? 'bg-destructive/10 border-destructive/30 text-destructive'
    : 'bg-accent/15 border-accent/30 text-foreground';

  return (
    <div className={`mb-6 rounded-xl border px-4 py-3 text-sm ${toneClasses}`}>
      {message}
    </div>
  );
}
