
import type { Metadata } from 'next';
import PeriodCarePage from '@/components/settings/period-care-page';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Period Care',
};

export default function PeriodCare() {
  return (
    <div className="space-y-6">
       <div className="flex justify-start">
         <Button asChild variant="outline">
            <Link href="/settings">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Settings
            </Link>
        </Button>
       </div>
      <PeriodCarePage />
    </div>
  );
}
