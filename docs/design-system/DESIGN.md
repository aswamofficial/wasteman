---
name: Wasteman Design System
colors:
  surface: '#fef8f0'
  surface-dim: '#dfd9d2'
  surface-bright: '#fef8f0'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f9f3eb'
  surface-container: '#f3ede5'
  surface-container-high: '#ede7e0'
  surface-container-highest: '#e7e2da'
  on-surface: '#1d1b17'
  on-surface-variant: '#404849'
  inverse-surface: '#32302b'
  inverse-on-surface: '#f6f0e8'
  outline: '#707979'
  outline-variant: '#bfc8c9'
  surface-tint: '#2b676c'
  primary: '#003a3e'
  on-primary: '#ffffff'
  primary-container: '#0f5257'
  on-primary-container: '#89c4c9'
  inverse-primary: '#96d0d6'
  secondary: '#006a68'
  on-secondary: '#ffffff'
  secondary-container: '#8df0ee'
  on-secondary-container: '#006e6d'
  tertiary: '#073a3c'
  on-tertiary: '#ffffff'
  tertiary-container: '#245153'
  on-tertiary-container: '#95c2c4'
  error: '#A8564C'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b2edf2'
  primary-fixed-dim: '#96d0d6'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#084f54'
  secondary-fixed: '#90f3f1'
  secondary-fixed-dim: '#73d6d4'
  on-secondary-fixed: '#00201f'
  on-secondary-fixed-variant: '#00504f'
  tertiary-fixed: '#bdebed'
  tertiary-fixed-dim: '#a1cfd1'
  on-tertiary-fixed: '#002021'
  on-tertiary-fixed-variant: '#204d4f'
  background: '#fef8f0'
  on-background: '#1d1b17'
  surface-variant: '#e7e2da'
  warm-taupe: '#D6CCC2'
  amber: '#E8A33D'
  secondary-text: '#5A6B6C'
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 28px
  title-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  caption:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  micro-label:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 20px
  xl: 24px
  gutter: 12px
  margin: 20px
---

## Brand & Style

This design system embodies a **Safe** and reliable visual identity, specifically tailored for municipal service delivery. The brand personality is professional, civic-minded, and efficient, striking a balance between government authority and modern technological innovation.

The aesthetic utilizes **Corporate / Modern** principles with a tactile warmth. By leveraging a Warm Ivory background instead of a clinical white, the interface feels approachable and community-oriented. The design focuses on "Photography-Forward" layouts where user-generated content is framed by clean, structured data overlays. Distinctive architectural flourishes, such as asymmetrical corner radii on header panels, provide a unique silhouette that differentiates the product from standard utility applications.

The target emotional response is one of **trust and resolution**. Citizens should feel that their contributions are being handled by an organized, high-tech authority, while administrators are provided with a focused, data-rich environment that minimizes cognitive load.

## Colors

The color palette is rooted in environmental and municipal stability. 

- **Deep Teal (Primary):** Used for core branding, headlines, and "Resolved" states to project authority and successful completion.
- **Turquoise (Secondary):** The primary action color, used for CTAs, progress indicators, and "In Progress" states.
- **Pale Aqua (Tertiary):** Applied to soft surfaces, chips, and notification tints to provide a tech-forward "AI" aesthetic.
- **Warm Ivory (Neutral):** The foundational surface color, providing a soft, non-clinical backdrop for all interactions.

**Status System:**
- **PENDING:** Amber (`#E8A33D`) to denote urgency and required attention.
- **IN PROGRESS:** Turquoise (`#5BC0BE`) to signal active movement.
- **RESOLVED:** Deep Teal (`#0F5257`) to signal finality and institutional success.

## Typography

The typography strategy separates editorial brand expression from functional utility. 

**Plus Jakarta Sans** is reserved for headlines and titles, offering a soft, welcoming, and optimistic tone to the brand's primary messages. **Inter** handles the functional heavy-lifting, used for body copy, form labels, and data points to ensure maximum legibility and a systematic, corporate feel.

The **Micro-label** style is a critical component of the hierarchy, using uppercase transformation and increased letter-spacing to organize dense information (like coordinates or waste types) without competing with primary body text.

## Layout & Spacing

The layout philosophy follows a **Fixed Grid** approach for mobile-first delivery (390px baseline), transitioning to a multi-column fluid structure on larger screens. 

The rhythm is dictated by an 8px base unit, with 12px vertical gaps between stacked cards to maintain breathing room. Generous 20px margins ensure that content never feels cramped against the device edges. Bottom sheets and hero panels use larger vertical padding (24px-28px) to emphasize their role as primary containers for interaction.

## Elevation & Depth

Visual hierarchy is established through **Tonal Layers** and **Ambient Shadows**. The design avoids harsh borders, opting for depth to indicate interactable surfaces.

- **Surface 0 (Base):** Warm Ivory background.
- **Surface 1 (Cards):** Slightly elevated with soft, diffused shadows. These shadows should use a low-opacity Deep Teal tint rather than pure black to maintain color harmony.
- **Surface 2 (Interactive):** Elements like the Floating Action Button (FAB) and Bottom Sheets occupy the highest elevation, using more pronounced diffusion to signify they sit above the main content layer.
- **Overlays:** Dark scrim gradients are applied over hero images and camera viewfinders to ensure text legibility while maintaining the "Photography-Forward" philosophy.

## Shapes

The shape language is defined by a **Rounded (2)** setting, which translates to a standard 0.5rem (8px) base radius. However, specific components exceed this to create a friendly, accessible feel.

- **Standard Cards:** 20px radius for a soft, approachable container.
- **Bottom Sheets:** 24px-28px top-corner radius to emphasize their organic "pull-up" nature.
- **Inputs:** 14px radius for a modern, touch-friendly appearance.
- **Buttons:** Full-pill (rounded-full) styling for all primary and secondary actions.
- **Distinctive Brand Shape:** Primary header panels feature a unique 32px bottom-left corner radius, while other corners remain standard or sharp, creating a recognizable brand silhouette.

## Components

**Buttons:** 
Primary actions use the Turquoise fill with white icons/text and a full-pill shape. Secondary buttons use a Warm Taupe outline or ghost style.

**Chips & Status:**
Status chips must follow the fixed status system. They use a pill shape with 12px horizontal padding. The text should be semi-bold Inter at 13px.

**Cards:**
Cards are the primary content vehicle. They feature 20px rounded corners and a 1px Warm Taupe border or a soft diffused shadow depending on the surface elevation.

**Input Fields:**
Inputs use a 14px radius with a 1px Warm Taupe border. On focus, the border transitions to 2px Turquoise. Labels use the Inter Body-MD style, while helper text uses Caption style.

**Lists:**
List items are separated by 12px vertical gaps. Dividers, when used, are 1px thick in Warm Taupe.

**Bottom Navigation:**
Floating above the Warm Ivory base, the navigation bar uses the same background color but is separated by a soft shadow. Active states are indicated by Deep Teal icons.