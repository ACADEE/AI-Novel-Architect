export interface Ghostwriter {
  id: string;
  name: string;
  style: string;
  description: string;
  pictureUrl: string;
  isCustom?: boolean;
}

export const predefinedGhostwriters: Ghostwriter[] = [
  {
    id: "gw-viktor",
    name: "Viktor Noir",
    style: "Thriller psychologique",
    description:
      "Maître du suspense et de la tension psychologique. Construit des atmosphères oppressantes, des personnages torturés et des retournements de situation imprévisibles. Chaque chapitre se termine par une révélation qui pousse le lecteur à tourner la page.",
    pictureUrl: "https://www.acadee-formation.com/ghostwriters/viktor.jpg",
  },
  {
    id: "gw-sophie",
    name: "Sophie Lumière",
    style: "Romance contemporaine",
    description:
      "Spécialiste des récits émotionnels et des arcs romantiques. Dialogue naturel, développement de personnages profond et tension romantique subtile. Crée des relations authentiques qui touchent le lecteur au cœur.",
    pictureUrl: "https://www.acadee-formation.com/ghostwriters/sophie.jpg",
  },
  {
    id: "gw-atlas",
    name: "Atlas Forge",
    style: "Fantasy épique",
    description:
      "Architecte de mondes immersifs et de systèmes de magie cohérents. Excelle dans la création de cultures complexes, de prophéties et de conflits à grande échelle. Ses récits allient aventure épique et profondeur philosophique.",
    pictureUrl: "https://www.acadee-formation.com/ghostwriters/atlas.jpg",
  },
  {
    id: "gw-marie",
    name: "Marie Classique",
    style: "Littérature générale",
    description:
      "Prose élégante et introspective, influencée par les grands auteurs français. Idéale pour des récits qui explorent la condition humaine, les relations familiales et les questionnements existentiels avec finesse et nuance.",
    pictureUrl: "https://www.acadee-formation.com/ghostwriters/marie.jpg",
  },
  {
    id: "gw-rex",
    name: "Rex Pulp",
    style: "Action & Aventure",
    description:
      "Rythme effréné, dialogues percutants, action non-stop. Chaque scène est construite pour maintenir l'adrénaline au maximum. Parfait pour les thrillers d'action, les romans d'espionnage et les aventures à couper le souffle.",
    pictureUrl: "https://www.acadee-formation.com/ghostwriters/rex.jpg",
  },
  {
    id: "gw-lea",
    name: "Léa Nexus",
    style: "Science-Fiction",
    description:
      "Explore les frontières de la technologie, de l'humanité et du futur. Construit des mondes scientifiquement plausibles tout en posant des questions éthiques profondes. Du space opera à la cyberpunk, elle maîtrise tous les sous-genres.",
    pictureUrl: "https://www.acadee-formation.com/ghostwriters/lea.jpg",
  },
];

// AI-generated description enhancement patterns
export function generateEnhancedDescription(name: string, style: string, currentDesc: string): string {
  return `${name} est un ghost writer IA spécialisé en ${style}. ${currentDesc.trim()} Sa signature narrative unique combine une maîtrise stylistique approfondie avec une compréhension instinctive des attentes du lectorat cible. Il adapte son registre, son rythme et sa voix à chaque projet pour produire une œuvre authentiquement cohérente.`;
}
