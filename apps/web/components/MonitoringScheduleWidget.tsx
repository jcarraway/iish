'use client';

import type { ScheduleEntry } from '@/lib/monitoring';

interface MonitoringScheduleWidgetProps {
  schedule: ScheduleEntry[];
  onSubmitReport?: (reportType: string) => void;
}

const STATUS_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
  completed: { icon: '\u2713', color: 'text-green-600', bg: 'bg-green-100' },
  due_today: { icon: '!', color: 'text-blue-600', bg: 'bg-blue-100' },
  overdue: { icon: '!', color: 'text-red-600', bg: 'bg-red-100' },
  upcoming: { icon: '\u2022', color: 'text-gray-400', bg: 'bg-gray-100' },
};

export default function MonitoringScheduleWidget({ schedule, onSubmitReport }: MonitoringScheduleWidgetProps) {
  const overdueCount = schedule.filter((s) => s.status === 'overdue').length;

  return (
    <div className="rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Monitoring Schedule</h3>
        {overdueCount > 0 && (
          <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
            {overdueCount} overdue
          </span>
        )}
      </div>

      <div className="mt-4 space-y-2">
        {schedule.map((entry) => {
          const config = STATUS_CONFIG[entry.status];
          return (
            <div
              key={entry.reportType}
              className={`flex items-center justify-between rounded-lg p-3 ${
                entry.status === 'overdue' ? 'bg-red-50' : entry.status === 'due_today' ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${config.bg} ${config.color}`}>
                  {config.icon}
                </div>
                <div>
                  <p className={`text-sm font-medium ${entry.status === 'upcoming' ? 'text-gray-400' : 'text-gray-900'}`}>
                    {entry.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    {entry.status === 'completed' && entry.submittedAt
                      ? `Submitted ${new Date(entry.submittedAt).toLocaleDateString()}`
                      : `Due ${entry.dueDate.toLocaleDateString()}`}
                    {entry.required && <span className="ml-1 text-gray-400">\u00B7 Required</span>}
                  </p>
                </div>
              </div>

              {entry.status !== 'completed' && entry.status !== 'upcoming' && onSubmitReport && (
                <button
                  onClick={() => onSubmitReport(entry.reportType)}
                  className={`flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium ${
                    entry.status === 'overdue'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Submit
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
