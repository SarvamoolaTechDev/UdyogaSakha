import { CreateOpportunityForm } from '@/components/ui/CreateOpportunityForm';

export const metadata = { title: 'Post Opportunity' };

export default function NewOpportunityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Post an Opportunity</h1>
        <p className="text-sm text-gray-500 mt-1">
          Your listing will be reviewed by the Foundation before going live.
        </p>
      </div>
      <CreateOpportunityForm />
    </div>
  );
}
