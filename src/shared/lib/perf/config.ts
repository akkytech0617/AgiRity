const ENV_PERF = 'AGIRITY_PERF';

export const isPerfEnabled = (): boolean => {
  return process.env[ENV_PERF] === 'true';
};
