export function inputPath(patientId: string, jobId: string, filename: string): string {
  return `input/${patientId}/${jobId}/${filename}`;
}

export function intermediatePath(jobId: string, filename: string): string {
  return `intermediate/${jobId}/${filename}`;
}

export function resultsPath(jobId: string, filename: string): string {
  return `results/${jobId}/${filename}`;
}

export function referencePath(genome: string, filename: string): string {
  return `reference/${genome}/${filename}`;
}
