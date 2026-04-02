export function moduleTypeLabel(type: string): string {
  const map: Record<string, string> = {
    EMPLOYMENT_EXCHANGE: 'Employment', AGENCY_STAFF_AUG: 'Agency',
    PROJECT_TENDER: 'Project/Tender', CONSULTANCY_ADVISORY: 'Consultancy',
    SERVICE_ENGAGEMENT: 'Service Roles', VENDOR_MARKETPLACE: 'Vendor',
    TRAINING_SKILL_DEV: 'Training', STARTUP_INNOVATION: 'Startup',
    VOLUNTEER_SOCIAL: 'Volunteer',
  };
  return map[type] ?? type;
}
