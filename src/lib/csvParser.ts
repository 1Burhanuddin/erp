/**
 * CSV Parser Utility
 * Handles parsing CSV files and converting them to structured data
 */

export interface CSVParseResult<T> {
  data: T[];
  errors: string[];
  totalRows: number;
  validRows: number;
}

/**
 * Parse CSV file content
 */
export function parseCSV<T>(
  csvContent: string,
  mapper: (row: Record<string, string>, index: number) => T | null,
  options: { skipFirstRow?: boolean; delimiter?: string } = {}
): CSVParseResult<T> {
  const { skipFirstRow = true, delimiter = ',' } = options;
  const lines = csvContent.split('\n').filter(line => line.trim());
  const errors: string[] = [];
  const data: T[] = [];

  if (lines.length === 0) {
    errors.push('CSV file is empty');
    return { data, errors, totalRows: 0, validRows: 0 };
  }

  // Parse header
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine, delimiter).map(h => h.trim().toLowerCase());

  // Start from row 1 if skipping header, otherwise from row 0
  const startIndex = skipFirstRow ? 1 : 0;
  const totalRows = lines.length - (skipFirstRow ? 1 : 0);

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    try {
      const values = parseCSVLine(line, delimiter);
      const row: Record<string, string> = {};

      headers.forEach((header, index) => {
        row[header] = values[index]?.trim() || '';
      });

      const mapped = mapper(row, i - startIndex);
      if (mapped) {
        data.push(mapped);
      } else {
        errors.push(`Row ${i + 1}: Failed to map data`);
      }
    } catch (error) {
      errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return {
    data,
    errors,
    totalRows,
    validRows: data.length,
  };
}

/**
 * Parse a single CSV line handling quoted values
 */
function parseCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

/**
 * Download data as CSV
 */
export function downloadCSV<T>(
  data: T[],
  headers: string[],
  getRowValues: (item: T) => string[],
  filename: string = 'export.csv'
): void {
  const csvContent = [
    headers.join(','),
    ...data.map(item => {
      const values = getRowValues(item);
      // Escape values that contain commas or quotes
      return values.map(val => {
        const stringVal = String(val || '');
        if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
          return `"${stringVal.replace(/"/g, '""')}"`;
        }
        return stringVal;
      }).join(',');
    }),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
