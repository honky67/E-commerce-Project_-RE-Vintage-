import SlashHeading from "./SlashHeading";

export default function PageShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <SlashHeading as="h1" className="mb-8">
        {title}
      </SlashHeading>
      {children}
    </div>
  );
}
