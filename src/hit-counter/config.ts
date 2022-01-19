export const GSI1 = 'GSI1';
export const GSI1_PK = 'GSI1PK';
export const GSI1_SK = 'GSI1SK';

export const ENV_HITS_TABLE = 'HITS_TABLE';

export function getHitsTable() {
  const hitsTable = process.env[ENV_HITS_TABLE];

  if (!hitsTable) {
    throw new Error(`Missing ${ENV_HITS_TABLE}`);
  }

  return hitsTable;
}