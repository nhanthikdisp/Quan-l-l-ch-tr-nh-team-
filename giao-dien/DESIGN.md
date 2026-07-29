---
name: Moo-dern Productivity
colors:
  surface: '#fff8f5'
  surface-dim: '#e4d8cf'
  surface-bright: '#fff8f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff1e8'
  surface-container: '#f9ebe3'
  surface-container-high: '#f3e6dd'
  surface-container-highest: '#ede0d8'
  on-surface: '#211a15'
  on-surface-variant: '#444748'
  inverse-surface: '#362f29'
  inverse-on-surface: '#fceee6'
  outline: '#747878'
  outline-variant: '#c4c7c8'
  surface-tint: '#5d5f5f'
  primary: '#5d5f5f'
  on-primary: '#ffffff'
  primary-container: '#f5f5f5'
  on-primary-container: '#6f7070'
  inverse-primary: '#c6c6c7'
  secondary: '#635d5a'
  on-secondary: '#ffffff'
  secondary-container: '#e6ded9'
  on-secondary-container: '#67625e'
  tertiary: '#81515a'
  on-tertiary: '#ffffff'
  tertiary-container: '#fff2f3'
  on-tertiary-container: '#95626b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c7'
  on-primary-fixed: '#1a1c1c'
  on-primary-fixed-variant: '#454747'
  secondary-fixed: '#e9e1dc'
  secondary-fixed-dim: '#cdc5c0'
  on-secondary-fixed: '#1e1b18'
  on-secondary-fixed-variant: '#4b4642'
  tertiary-fixed: '#ffd9df'
  tertiary-fixed-dim: '#f4b6c1'
  on-tertiary-fixed: '#330f19'
  on-tertiary-fixed-variant: '#663a43'
  background: '#fff8f5'
  on-background: '#211a15'
  surface-variant: '#ede0d8'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 8px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
  container-max: 1440px
---

## Brand & Style

This design system establishes a "Moo-dern" aesthetic—a unique blend of playful bovine themes with high-utility SaaS professionalism. The brand personality is dependable yet whimsical, turning the potentially dry nature of task management into a friendly, approachable experience.

The visual style leans into **Minimalism with Tactile elements**. It utilizes a clean, cream-based canvas punctuated by "cow-spot" motifs (dark espresso shapes) and soft pink accents. The interface avoids the sterile look of traditional enterprise software by using hyper-rounded geometry and organic patterns, ensuring the product feels organic and "pasture-fresh" while maintaining the rigor required for productivity.

## Colors

The palette is rooted in a natural, dairy-inspired spectrum. 

*   **Primary (Cream - #F5F5F5):** The foundation of the UI. It replaces pure white to reduce eye strain and provide a warmer, more "organic" feel.
*   **Secondary (Espresso - #2D2926):** Used for "cow spot" decorative elements, sidebar backgrounds, and high-contrast components. It acts as the visual anchor.
*   **Accent (Soft Pink - #FFC0CB):** Reserved for primary actions (buttons) and meaningful status highlights. It represents the friendly, approachable nature of the brand.
*   **Text (Deep Brown - #4A423C):** Used for body copy and headers to maintain warmth while ensuring AAA accessibility against the cream background.

## Typography

This design system uses **Plus Jakarta Sans** across all levels. Its soft, rounded terminals and modern geometric construction perfectly complement the "Moo-dern" theme.

Headlines use heavy weights (Bold/ExtraBold) to feel punchy and confident. Body text is kept clean with generous line heights to ensure readability in dense task lists. Labels utilize slightly increased letter spacing and semi-bold weights to remain distinct at smaller sizes.

## Layout & Spacing

The design system employs a **Fluid Grid** model with a base-8 spacing scale. 

*   **Grid:** A 12-column system is used for desktop views.
*   **Safe Areas:** Sidebars and navigation panels are treated as distinct "islands" with high internal padding (24px) to emphasize the rounded shape language.
*   **Patterns:** Subtle, low-opacity cow-print patterns (using the Espresso color at 3-5% opacity) can be used as background fills for the main sidebar or empty state illustrations.
*   **Reflow:** On mobile, the multi-column task view collapses into a single-column stack, increasing the primary margin to 16px to maintain the "island" aesthetic.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and **Soft Shadows** rather than harsh borders.

1.  **Canvas:** The base layer is the Primary Cream.
2.  **Islands (Cards/Panels):** Elements sit on white surfaces with a soft, diffused shadow (`0px 10px 30px rgba(74, 66, 60, 0.05)`).
3.  **Depth:** To simulate a "tactile" feel, primary buttons use a slight bottom-heavy shadow to suggest they are "squishy" and pressable.
4.  **Floating Elements:** Modals and dropdowns use a more pronounced espresso-tinted shadow to sit clearly above the workspace.

## Shapes

The shape language is the defining characteristic of this design system. It is **Hyper-Rounded (Pill-shaped)**.

All UI components—from buttons and input fields to the containers themselves—feature large corner radii. This mimics the organic, soft curves of the brand's namesake. Circular elements should be used for avatars and status indicators, while cards should utilize `rounded-xl` (1.5rem / 24px) to maintain the friendly SaaS vibe.

## Components

### Buttons
*   **Primary:** Filled Soft Pink (#FFC0CB) with Deep Brown text. Pill-shaped. On hover, the shadow deepens to create a "pressable" effect.
*   **Secondary:** Cream background with an Espresso "spot" border (2px). 

### Tasks & Cards
*   Tasks appear as pill-shaped rows or rounded cards. 
*   **Cow-Spot Status:** Completed tasks can feature a small Espresso-colored "spot" icon instead of a standard checkmark.

### Input Fields
*   Generous internal padding (16px) with a subtle Cream-tinted stroke. Focus states use a Soft Pink glow.

### Chips & Badges
*   Used for task categories. These are small, fully-rounded pills using various pastel shades (Soft Sage, Pale Sky Blue) to keep the "pasture" theme consistent, but always with Deep Brown text for legibility.

### Icons
*   Iconography must be "friendly" and "thick." Avoid razor-thin lines; use a 2px or 2.5px stroke width with rounded caps and joins.