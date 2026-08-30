import next from 'eslint-config-next/core-web-vitals';

const config = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'coverage/**',
      'test-results/**',
      'Legacy_Game/**',
      'docs/internal_governance/handoff_in/_archive/**',
    ],
  },
  ...next,
  {
    rules: { '@next/next/no-html-link-for-pages': 'off' },
  },
  {
    files: ['game/**/*.ts', 'scripts/**/*.mjs', 'tests/**/*.ts'],
    rules: {
      '@next/next/no-img-element': 'off',
      '@next/next/no-location-assign-relative-destination': 'off',
      'react-hooks/rules-of-hooks': 'off',
    },
  },
];

export default config;
