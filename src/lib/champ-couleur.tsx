import { useState } from 'react';
import { fields, type FormFieldInputProps } from '@keystatic/core';
import { Flex } from '@keystar/ui/layout';
import { TextField } from '@keystar/ui/text-field';
import { Text } from '@keystar/ui/typography';
import { FICHIERS_BUILDS } from './fichiers-builds';

const HEX = /^#[0-9a-fA-F]{6}$/;

/** « sombre » pour un fond de page, « vive » pour un titre ou un accent. */
type Ton = 'sombre' | 'vive';

const STUDIO = [
  { hex: '#0D0D0E', nom: 'Studio (fond)' },
  { hex: '#EEE7D7', nom: 'Studio (texte)' },
  { hex: '#FF5A36', nom: 'Studio (accent)' },
  { hex: '#E3B04B', nom: 'Studio (au ralenti)' },
];

// Couleurs déjà en place dans les builds, lues dans leurs fichiers au moment du build du site.
function couleursUtilisees() {
  const noms = new Map<string, string[]>();
  const ajouter = (hex: string, nom: string) => {
    const cle = hex.toUpperCase();
    const liste = noms.get(cle) ?? [];
    if (!liste.includes(nom)) liste.push(nom);
    noms.set(cle, liste);
  };
  for (const { hex, nom } of STUDIO) ajouter(hex, nom);
  for (const { nom, texte } of FICHIERS_BUILDS) {
    for (const [hex] of texte.matchAll(/#[0-9a-fA-F]{6}/g)) ajouter(hex, nom);
  }
  return [...noms].map(([hex, utilisateurs]) => ({ hex, utilisateurs }));
}

const PALETTE = couleursUtilisees();

/** Luminance relative (WCAG) : 0 pour le noir, 1 pour le blanc. */
function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const estSombre = (hex: string) => luminance(hex) < 0.05;

function ChampCouleur({
  value,
  onChange,
  autoFocus,
  forceValidation,
  label,
  description,
  ton,
}: FormFieldInputProps<string> & { label: string; description?: string; ton: Ton }) {
  const [quitte, setQuitte] = useState(false);
  const valide = HEX.test(value);
  const actuelle = value.toUpperCase();
  const erreur =
    (forceValidation || quitte) && !valide
      ? value
        ? 'Format attendu : #RRGGBB'
        : `${label} est obligatoire`
      : undefined;
  const suggestions = PALETTE.filter((c) => (ton === 'sombre' ? estSombre(c.hex) : !estSombre(c.hex)));
  const alerte = !valide
    ? undefined
    : ton === 'sombre' && !estSombre(value)
      ? 'Attention : ce fond est clair. Le texte du site reste clair, il serait peu lisible.'
      : ton === 'vive' && estSombre(value)
        ? 'Attention : cette couleur est très sombre. Sur les fonds sombres du site, elle serait presque invisible.'
        : undefined;

  return (
    <Flex direction="column" gap="regular">
      <TextField
        label={label}
        description={description}
        value={value}
        onChange={(texte: string) => onChange(texte.trim())}
        onBlur={() => setQuitte(true)}
        autoFocus={autoFocus}
        isRequired
        errorMessage={erreur}
      />
      <Flex gap="regular" alignItems="center" wrap>
        <input
          type="color"
          aria-label={`${label} : choisir une couleur`}
          title="Choisir une couleur"
          value={valide ? value : '#000000'}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          style={{
            width: 44,
            height: 32,
            padding: 2,
            border: '1px solid rgb(128 128 128 / 0.45)',
            borderRadius: 6,
            background: 'transparent',
            cursor: 'pointer',
          }}
        />
        {suggestions.length > 0 && (
          <Text size="small" color="neutralSecondary">
            Déjà utilisées :
          </Text>
        )}
        {suggestions.map((c) => {
          const choisie = c.hex === actuelle;
          return (
            <button
              key={c.hex}
              type="button"
              title={`${c.hex} · ${c.utilisateurs.join(', ')}`}
              aria-label={`${c.hex}, utilisée par ${c.utilisateurs.join(', ')}`}
              aria-pressed={choisie}
              onClick={() => onChange(c.hex)}
              style={{
                width: 28,
                height: 28,
                padding: 0,
                borderRadius: 6,
                background: c.hex,
                border: choisie ? '2px solid currentColor' : '1px solid rgb(128 128 128 / 0.45)',
                outline: choisie ? '2px solid rgb(128 128 128 / 0.6)' : 'none',
                outlineOffset: 2,
                cursor: 'pointer',
              }}
            />
          );
        })}
      </Flex>
      {alerte && (
        <Text size="small" color="neutralSecondary">
          {alerte}
        </Text>
      )}
    </Flex>
  );
}

/**
 * Champ couleur pour l'admin : la validation est celle d'un champ texte (#RRGGBB obligatoire),
 * l'affichage ajoute un sélecteur visuel et les couleurs déjà utilisées par le studio et les builds.
 */
export function couleur(label: string, description: string, ton: Ton) {
  const champ = fields.text({
    label,
    description,
    validation: { isRequired: true, pattern: { regex: HEX, message: 'Format attendu : #RRGGBB' } },
  });
  return {
    ...champ,
    Input: (props: FormFieldInputProps<string>) => (
      <ChampCouleur {...props} label={label} description={description} ton={ton} />
    ),
  };
}
