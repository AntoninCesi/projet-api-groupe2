import nextJest from 'next/jest.js';

// Config Jest pour Next.js : gère le ESM, le JSX et l'alias "@/..." automatiquement.
const createJestConfig = nextJest({ dir: './' });

export default createJestConfig({
  testEnvironment: 'node', // tests de fonctions pures (pas de DOM)
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
});
