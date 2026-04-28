import type { SessionRecord } from '@/types/session';

/**
 * Formats a duration in seconds into a string formatted as HH:MM:SS.
 * 
 * @param seconds - Duration in seconds.
 * @returns Formatted duration string.
 */
function formatDur(seconds: number): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const sec = seconds % 60;
  return `${pad(h)}:${pad(m)}:${pad(sec)}`;
}

/**
 * Exports a list of session records to a CSV file and triggers a browser download.
 *
 * @param sessions - The complete list of session records to export.
 */
export async function exportSessionsToCSV(sessions: SessionRecord[]): Promise<void> {
  if (!sessions || sessions.length === 0) return;

  const pad = (n: number) => String(n).padStart(2, '0');
  const formatDate = (d: Date) => `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
  const formatTime = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

  const headers = [
    'Start Date',
    'Start Time',
    'End Date',
    'End Time',
    'Method',
    'Amount',
    'Unit',
    'Strain',
    'Duration',
    'Duration Adjusted',
    'Rating',
  ];

  const rows = sessions.map((s) => {
    const startDate = new Date(s.start_time);
    const endDate = new Date(s.end_time);

    let amountVal = 'N/A';
    let unitVal = 'N/A';
    if (s.amount !== undefined) {
      amountVal = s.amount.toFixed(3);
      unitVal = s.amount_unit || 'g';
    }

    return [
      formatDate(startDate),
      formatTime(startDate),
      formatDate(endDate),
      formatTime(endDate),
      s.method || 'N/A',
      amountVal,
      unitVal,
      s.custom_name || 'N/A',
      formatDur(s.duration_seconds),
      s.is_adjusted ? 'True' : 'False',
      s.rating || 'N/A',
    ]
      .map((val) => `"${String(val).replace(/"/g, '""')}"`)
      .join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `openpot_full_log_${new Date().toISOString().split('T')[0]}.csv`);
  
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
