'use client';

interface AdministrationSiteCardProps {
  site: {
    id: string;
    name: string;
    type: string;
    city: string | null;
    state: string | null;
    distance?: number;
    canAdministerMrna: boolean;
    hasInfusionCenter: boolean;
    hasEmergencyResponse: boolean;
    hasMonitoringCapacity: boolean;
    investigationalExp: boolean;
    irbAffiliation: string | null;
    verified: boolean;
    contactPhone: string | null;
    website: string | null;
  };
  onSelect?: (siteId: string) => void;
}

const TYPE_LABELS: Record<string, string> = {
  academic_medical_center: 'Academic Medical Center',
  community_oncology: 'Community Oncology',
  infusion_center: 'Infusion Center',
  hospital: 'Hospital',
};

const CAPABILITY_BADGES: { key: string; label: string; color: string }[] = [
  { key: 'canAdministerMrna', label: 'mRNA', color: 'bg-purple-100 text-purple-700' },
  { key: 'hasInfusionCenter', label: 'Infusion', color: 'bg-blue-100 text-blue-700' },
  { key: 'hasEmergencyResponse', label: 'Emergency', color: 'bg-red-100 text-red-700' },
  { key: 'hasMonitoringCapacity', label: 'Monitoring', color: 'bg-green-100 text-green-700' },
  { key: 'investigationalExp', label: 'Investigational', color: 'bg-amber-100 text-amber-700' },
];

export default function AdministrationSiteCard({ site, onSelect }: AdministrationSiteCardProps) {
  const activeCapabilities = CAPABILITY_BADGES.filter(
    (cap) => site[cap.key as keyof typeof site] === true,
  );

  return (
    <div className="rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{site.name}</h3>
          <p className="mt-0.5 text-xs text-gray-500">
            {TYPE_LABELS[site.type] ?? site.type}
            {site.city && site.state && ` \u00B7 ${site.city}, ${site.state}`}
          </p>
        </div>
        {site.distance != null && (
          <span className="flex-shrink-0 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
            {site.distance} mi
          </span>
        )}
      </div>

      {/* Capabilities */}
      {activeCapabilities.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {activeCapabilities.map((cap) => (
            <span key={cap.key} className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${cap.color}`}>
              {cap.label}
            </span>
          ))}
        </div>
      )}

      {/* IRB */}
      {site.irbAffiliation && (
        <p className="mt-2 text-xs text-gray-500">IRB: {site.irbAffiliation}</p>
      )}

      {/* Contact */}
      <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
        {site.contactPhone && <span>{site.contactPhone}</span>}
        {site.website && (
          <a
            href={site.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            Website
          </a>
        )}
      </div>

      {onSelect && (
        <button
          onClick={() => onSelect(site.id)}
          className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Select this site
        </button>
      )}
    </div>
  );
}
