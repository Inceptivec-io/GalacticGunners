import next from 'eslint-config-next/core-web-vitals';

export default [
  ...next,
  {
    ignores: ['.next/**', 'node_modules/**', 'coverage/**', 'test-results/**', 'docs/internal_governance/handoff_in/_archive/**'],
  },
];
