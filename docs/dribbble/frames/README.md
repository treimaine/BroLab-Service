# Dribbble ELECTRI-X Reference Frames

Ce dossier doit contenir les frames de référence extraites de la vidéo `Dribbble reference.mov`.

## Comment extraire les frames

### Option 1: VLC Media Player
1. Ouvrir `Dribbble reference.mov` dans VLC
2. Aller à `Video > Take Snapshot` (ou Shift+S) aux moments clés
3. Renommer les fichiers en `frame_00.png`, `frame_01.png`, etc.

### Option 2: ffmpeg (si installé)
```bash
ffmpeg -i "Dribbble reference.mov" -vf fps=2 docs/dribbble/frames/frame_%02d.png
```

### Option 3: Outil en ligne
- Utiliser un convertisseur vidéo-to-frames en ligne

## Frames recommandées (8-12 captures)

| Frame | Description | Timing approximatif |
|-------|-------------|---------------------|
| frame_00 | Hero initial (EXPLORE centered) | 0:00 |
| frame_01 | IconRail hover state | 0:02 |
| frame_02 | Hero avec illustration | 0:04 |
| frame_03 | Scroll transition | 0:06 |
| frame_04 | Features section | 0:08 |
| frame_05 | Feature card hover | 0:10 |
| frame_06 | CTA section | 0:12 |
| frame_07 | Footer | 0:14 |
| frame_08 | Mobile view (si présent) | 0:16 |

## Utilisation

Ces frames servent de **source de vérité visuelle** pour :
- Valider la composition du layout
- Vérifier les espacements et proportions
- Comparer les couleurs et effets
- Reproduire les micro-interactions
