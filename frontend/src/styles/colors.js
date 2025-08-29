/**
 * RSSB Sewadar Management - Color System
 * 
 * Comprehensive color palette based on RSSB brand guidelines.
 * Includes semantic color tokens for consistent usage across the application.
 * 
 * Usage:
 * import { colors, semanticColors } from './styles/colors';
 * 
 * const primaryButton = {
 *   backgroundColor: semanticColors.primary.main,
 *   color: semanticColors.primary.contrast,
 * };
 */

// Base Brand Colors
export const brandColors = {
  // Primary RSSB Colors
  deepRed: '#8B0000',           // Primary brand color - Deep Red
  charcoal: '#212529',          // Primary text color - Charcoal  
  cornsilk: '#FFF8DC',          // Background color - Cornsilk
  brightBlue: '#007BFF',        // Secondary color - Bright Blue
  white: '#FFFFFF',             // Pure white
  
  // Extended Brand Palette
  cream: {
    50: '#F6F4EF',              // Lightest cream
    100: '#E8E4DA',             // Light cream
    200: '#C6C1B4',             // Medium cream
    300: '#837E78',             // Dark cream/gray
  },
  
  blue: {
    50: '#7C9CBF',              // Light accent blue
    100: '#5C7894',             // Medium blue
    200: '#415A77',             // Darker blue
    300: '#324358',             // Darkest blue
  },
  
  warm: {
    50: '#EAB570',              // Light gold
    100: '#EB8573',             // Peach
    200: '#E0615F',             // Coral
    300: '#C1912B',             // Gold
  },
  
  neutral: {
    50: '#EEE8DC',              // Beige
  }
};

// Semantic Color System
export const semanticColors = {
  // Primary Brand Color
  primary: {
    main: brandColors.deepRed,
    light: '#A52A2A',           // Lighter red for hover states
    dark: '#660000',            // Darker red for active states
    contrast: brandColors.white, // Text color on primary
  },
  
  // Secondary Brand Color
  secondary: {
    main: brandColors.brightBlue,
    light: '#0099FF',           // Lighter blue for hover
    dark: '#0056B3',            // Darker blue for active
    contrast: brandColors.white, // Text color on secondary
  },
  
  // Background Colors
  background: {
    main: brandColors.cornsilk,  // Main app background
    paper: brandColors.white,    // Cards, modals, panels
    elevated: '#FEFEFE',         // Elevated surfaces
  },
  
  // Text Colors
  text: {
    primary: brandColors.charcoal,    // Main text
    secondary: '#6C757D',             // Muted text
    disabled: '#ADB5BD',              // Disabled text
    inverse: brandColors.white,       // Light text on dark backgrounds
  },
  
  // Border Colors
  border: {
    main: '#DEE2E6',            // Default borders
    light: '#F8F9FA',           // Light borders
    dark: '#ADB5BD',            // Dark borders
    focus: brandColors.brightBlue, // Focus ring color
  },
  
  // Status Colors
  status: {
    success: {
      main: '#28A745',
      light: '#D4EDDA',
      dark: '#1E7E34',
      contrast: brandColors.white,
    },
    warning: {
      main: '#FFC107',
      light: '#FFF3CD',
      dark: brandColors.warm[300], // Using brand gold
      contrast: brandColors.charcoal,
    },
    error: {
      main: '#DC3545',
      light: '#F8D7DA',
      dark: '#BD2130',
      contrast: brandColors.white,
    },
    info: {
      main: brandColors.brightBlue,
      light: '#CCE7FF',
      dark: brandColors.blue[200],
      contrast: brandColors.white,
    },
  },
  
  // Interactive States
  interactive: {
    hover: 'rgba(0, 0, 0, 0.04)',     // Light overlay for hover
    pressed: 'rgba(0, 0, 0, 0.08)',   // Darker overlay for pressed
    disabled: 'rgba(0, 0, 0, 0.12)',  // Disabled overlay
    focus: 'rgba(0, 123, 255, 0.25)', // Focus ring color with opacity
  },
};

// Contextual Colors (defined separately to avoid circular reference)
export const contextualColors = {
  naamdan: {
    complete: semanticColors.status.success.main,
    pending: brandColors.warm[100], // Using brand peach color
    text: brandColors.charcoal,
  },
  verification: {
    aadhar: brandColors.blue[100],   // Medium blue
    pan: brandColors.warm[200],      // Coral
    other: brandColors.cream[200],   // Medium cream
  },
  roles: {
    admin: brandColors.deepRed,      // Primary red
    editor: brandColors.brightBlue,  // Primary blue  
    viewer: brandColors.blue[100],   // Medium blue
  },
};

// Add contextual colors to semanticColors
semanticColors.contextual = contextualColors;

// Shadow System
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
};

// Spacing System (8px base)
export const spacing = {
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px  
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
  24: '6rem',    // 96px
};

// Border Radius System
export const borderRadius = {
  none: '0',
  sm: '0.25rem',    // 4px
  base: '0.5rem',   // 8px
  md: '0.75rem',    // 12px  
  lg: '1rem',       // 16px
  xl: '1.5rem',     // 24px
  full: '9999px',   // Pill shape
};

// Typography Scale
export const typography = {
  fontFamily: {
    sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    mono: ['Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],     // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }], // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],    // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }], // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],  // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],   // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
  },
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: '1.2',
    normal: '1.5',
    relaxed: '1.75',
  },
};

// Animation Durations
export const transitions = {
  fast: '150ms',
  normal: '250ms',
  slow: '350ms',
};

// Z-Index Scale
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1020,
  banner: 1030,
  overlay: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
};

// Breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Utility Functions
export const colorUtils = {
  /**
   * Get color with opacity
   * @param {string} color - Color value
   * @param {number} opacity - Opacity value (0-1)
   * @returns {string} RGBA color string
   */
  withOpacity: (color, opacity) => {
    // Simple RGB to RGBA conversion for hex colors
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);  
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return color;
  },
  
  /**
   * Get role-specific color
   * @param {string} role - User role (ADMIN, EDITOR, VIEWER)
   * @returns {string} Color value
   */
  getRoleColor: (role) => {
    const roleColors = {
      ADMIN: semanticColors.contextual.roles.admin,
      EDITOR: semanticColors.contextual.roles.editor,
      VIEWER: semanticColors.contextual.roles.viewer,
    };
    return roleColors[role] || semanticColors.text.secondary;
  },
  
  /**
   * Get verification type color
   * @param {string} type - Verification type (AADHAR, PAN, OTHER)
   * @returns {string} Color value
   */
  getVerificationColor: (type) => {
    const verificationColors = {
      AADHAR: semanticColors.contextual.verification.aadhar,
      PAN: semanticColors.contextual.verification.pan,
      OTHER: semanticColors.contextual.verification.other,
    };
    return verificationColors[type] || semanticColors.text.secondary;
  },
  
  /**
   * Get status color based on boolean
   * @param {boolean} status - Status boolean
   * @param {object} colors - Colors object with true/false keys
   * @returns {string} Color value
   */
  getStatusColor: (status, colors = { true: semanticColors.status.success.main, false: semanticColors.status.warning.main }) => {
    return colors[status] || semanticColors.text.secondary;
  }
};

// Export default theme object
export const theme = {
  colors: semanticColors,
  brandColors,
  shadows,
  spacing,
  borderRadius,
  typography,
  transitions,
  zIndex,
  breakpoints,
  utils: colorUtils,
};

export default theme;