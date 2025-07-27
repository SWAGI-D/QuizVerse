// src/components/TemplateGallery.tsx
import { useNavigate } from 'react-router-dom';

interface Theme {
  id: string;
  label: string;
  imageUrl: string;    // preview background
}

const THEMES: Theme[] = [
  { id: 'math',       label: 'math',       imageUrl: "assets/math.jpg" },
  { id: 'science',    label: 'science',    imageUrl: "assets/science.jpg" },
  { id: 'history',    label: 'history',    imageUrl: "assets/history.jpg" },
  { id: 'literature', label: 'literature', imageUrl: "assets/literature.jpg" },
  { id: 'computer',   label: 'computer',   imageUrl: "assets/computer.jpg" },
  { id: 'art',        label: 'art',        imageUrl: "assets/art.jpg" },
  { id: 'party',      label: 'party',      imageUrl: "assets/party.jpg" },
  { id: 'sport',     label: 'sport',     imageUrl: "assets/sport.jpg" },
  // …you can add more here…
];

export default function TemplateGallery() {
  const navigate = useNavigate();

  const pick = (theme: Theme) => {
    // pass theme.id (or whole theme) into quiz form
    navigate('/host', { state: { selectedTheme: theme.id } });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10">
      <h1 className="text-4xl font-bold mb-8 text-center">Choose a Theme</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {THEMES.map(t => (
          <div
            key={t.id}
            onClick={() => pick(t)}
            className="cursor-pointer rounded-2xl overflow-hidden shadow-lg hover:scale-105 transition-transform bg-white/10"
          >
            <img
              src={t.imageUrl}
              alt={t.label}
              className="w-full h-48 object-cover"
            />
            <div className="p-4 text-center text-xl font-semibold">
              {t.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
