import { ButtonLink, Eyebrow, StoneStack } from "@/components/ui";

export default function NotFound() {
  return (
    <section className="section bg-paper">
      <div className="wrap" style={{ display: "grid", gap: 20, justifyItems: "start", maxWidth: 760 }}>
        <StoneStack size={72} />
        <Eyebrow plain>Page not found</Eyebrow>
        <h1 className="h-section">This stone <em>isn’t here.</em></h1>
        <p className="lead">The story may have been withdrawn by its teller, or the link may be wrong.</p>
        <div className="btn-row">
          <ButtonLink href="/stories">Read the stories</ButtonLink>
          <ButtonLink href="/" kind="outline" arrow={false}>Go home</ButtonLink>
        </div>
      </div>
    </section>
  );
}
