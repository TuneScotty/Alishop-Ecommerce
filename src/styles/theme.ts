// Theme configuration for the e-commerce UI
const theme = {
  // Color palette
  colors: {
    // Primary colors
    primary: {
      light: '#6366F1', // Indigo 500
      main: '#4F46E5', // Indigo 600
      dark: '#4338CA', // Indigo 700
      gradient: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)',
    },
    // Secondary colors
    secondary: {
      light: '#F472B6', // Pink 400
      main: '#EC4899', // Pink 500
      dark: '#DB2777', // Pink 600
      gradient: 'linear-gradient(135deg, #F472B6 0%, #DB2777 100%)',
    },
    // Accent colors
    accent: {
      teal: '#14B8A6', // Teal 500
      purple: '#8B5CF6', // Purple 500
      amber: '#F59E0B', // Amber 500
      emerald: '#10B981', // Emerald 500
    },
    // Neutral colors
    neutral: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
    // Status colors
    status: {
      success: '#10B981', // Emerald 500
      warning: '#F59E0B', // Amber 500
      error: '#EF4444', // Red 500
      info: '#3B82F6', // Blue 500
    },
    // Background colors
    background: {
      light: '#FFFFFF',
      subtle: '#F9FAFB',
      glass: 'rgba(255, 255, 255, 0.8)',
      dark: '#111827',
    },
  },
  
  // Typography
  typography: {
    fontFamily: {
      primary: "'Poppins', sans-serif",
      secondary: "'Playfair Display', serif",
      accent: "'Dancing Script', cursive",
      mono: "'JetBrains Mono', monospace",
    },
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
      '6xl': '3.75rem',  // 60px
    },
    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },
  
  // Spacing
  spacing: {
    px: '1px',
    0: '0',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    11: '2.75rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    28: '7rem',
    32: '8rem',
    36: '9rem',
    40: '10rem',
    44: '11rem',
    48: '12rem',
    52: '13rem',
    56: '14rem',
    60: '15rem',
    64: '16rem',
    72: '18rem',
    80: '20rem',
    96: '24rem',
  },
  
  // Borders
  borders: {
    radius: {
      none: '0',
      sm: '0.125rem',
      default: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      '2xl': '1rem',
      '3xl': '1.5rem',
      full: '9999px',
    },
    width: {
      none: '0',
      thin: '1px',
      thick: '2px',
      thicker: '4px',
    },
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    default: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    outline: '0 0 0 3px rgba(66, 153, 225, 0.5)',
    none: 'none',
    // Neumorphic shadows
    neuLight: '10px 10px 20px #d1d9e6, -10px -10px 20px #ffffff',
    neuDark: '5px 5px 10px #161b25, -5px -5px 10px #202a3f',
    // Glass effect shadows
    glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  },
  
  // Z-index
  zIndex: {
    0: 0,
    10: 10,
    20: 20,
    30: 30,
    40: 40,
    50: 50,
    auto: 'auto',
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    drawer: 1300,
    modal: 1400,
    popover: 1500,
    tooltip: 1600,
  },
  
  // Transitions
  transitions: {
    duration: {
      fastest: '75ms',
      faster: '100ms',
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
      slower: '400ms',
      slowest: '500ms',
    },
    timing: {
      ease: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      linear: 'linear',
      easeIn: 'cubic-bezier(0.42, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.58, 1)',
      easeInOut: 'cubic-bezier(0.42, 0, 0.58, 1)',
      // Custom bezier curves for more natural animations
      bounce: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      elegant: 'cubic-bezier(0.6, 0.01, 0.05, 1)',
    },
  },
  
  // Breakpoints
  breakpoints: {
    xs: '0px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // Container
  container: {
    padding: {
      DEFAULT: '1rem',
      sm: '2rem',
      lg: '4rem',
      xl: '5rem',
      '2xl': '6rem',
    },
    maxWidth: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
  },
  
  // Effects
  effects: {
    glassmorphism: {
      light: 'backdrop-filter: blur(10px); background: rgba(255, 255, 255, 0.7);',
      dark: 'backdrop-filter: blur(10px); background: rgba(17, 24, 39, 0.7);',
      colored: 'backdrop-filter: blur(10px); background: rgba(79, 70, 229, 0.2);',
    },
    neumorphism: {
      light: 'background: #f0f0f3; box-shadow: 10px 10px 20px #d1d9e6, -10px -10px 20px #ffffff;',
      dark: 'background: #1a2035; box-shadow: 5px 5px 10px #161b25, -5px -5px 10px #202a3f;',
    },
  },
};

export default theme; 