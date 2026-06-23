/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // marque Trend (teal) — une seule couleur de marque
        glow: '#37E3D2',
        brand: '#06C2B2',
        press: '#04A192',
        deep: '#037D71',
        tint: '#DCF6F2',
        tint2: '#EAFAF7',
        onbrand: '#03302C',
        // surfaces light
        surface: '#FFFFFF',
        background: '#EFF5F3',
        line: '#E5EDEA',
        line2: '#EEF3F1',
        // textes
        ink: '#0C1B19',
        muted: '#54655F',
        faint: '#90A09B',
      },
      fontFamily: {
        title: ['var(--font-title)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      backgroundImage: {
        // dégradé signature 168° (glow -> brand 75% -> press) — contraste texte
        'brand-grad': 'linear-gradient(168deg, #37E3D2 0%, #06C2B2 75%, #04A192 100%)',
        avatar: 'linear-gradient(160deg, #143430, #0C1B19)',
        canvas:
          'radial-gradient(120% 46% at 50% 0%, #EAFBF7 0%, rgba(234,251,247,0) 52%), #EFF5F3',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(8,30,28,.04), 0 8px 24px -12px rgba(8,40,37,.18)',
        pop: '0 2px 6px rgba(8,30,28,.05), 0 18px 40px -16px rgba(8,40,37,.28)',
        glow: '0 10px 24px -8px rgba(6,194,178,.6), inset 0 1px 0 rgba(255,255,255,.85)',
        glowsm: '0 8px 18px -7px rgba(6,194,178,.55), inset 0 1px 0 rgba(255,255,255,.85)',
        seam: 'inset 0 1px 0 rgba(255,255,255,.85)',
      },
    },
  },
  plugins: [],
};
