export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Données structurées schema.org — contenu contrôlé côté serveur
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
