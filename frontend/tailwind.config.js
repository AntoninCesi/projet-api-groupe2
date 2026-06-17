/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // marque Trend (teal)
        glow: '#37E3D2',
        brand: '#06C2B2',
        press: '#04A192',
        deep: '#037D71',
        // surfaces light
        surface: '#FFFFFF',
        background: '#EFF5F3',
        line: '#E5EDEA',
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
        // dégradé signature 168° Glow -> Deep
        'brand-grad': 'linear-gradient(168deg, #37E3D2, #037D71)',
      },
    },
  },
  plugins: [],
};
