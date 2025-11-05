import { Locate } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Status } from '@/types';

interface EastWestProps {
  status: Status;
  district: string | null;
  error: string;
  requestPermission?: () => void;
  isCheckingPermission?: boolean;
}

export function EastWest({
  status,
  district,
  error,
  requestPermission,
  isCheckingPermission = false,
}: EastWestProps) {
  const getText = (): string => {
    // Hide "East or West?" text while checking permission
    if (status === 'pending' && isCheckingPermission) {
      return '';
    }
    switch (status) {
      case 'east':
        return 'East';
      case 'west':
        return 'West';
      case 'not-in-berlin':
        return 'Not in Berlin';
      case 'error':
        return error || 'Error';
      case 'loading':
        return 'Loading...';
      case 'pending':
        return 'East or West?';
      default:
        return '';
    }
  };

  return (
    <div className='px-5 text-center'>
      <h1 className='text-white text-[10vw] font-bold m-0 font-sans'>{getText()}</h1>
      {status === 'pending' && !isCheckingPermission && requestPermission && (
        <div className='flex justify-center mt-8'>
          <Button
            variant='primary'
            size='lg'
            onClick={requestPermission}
            className='px-8 py-6 text-xl'
          >
            <Locate className='w-6 h-6' />
            Wo bin ich?
          </Button>
        </div>
      )}
      {district && (
        <div className='text-white text-[5vw] font-normal mt-2.5 font-sans opacity-90'>
          {district}
        </div>
      )}
    </div>
  );
}

export function getBackgroundColorClass(status: Status): string {
  switch (status) {
    case 'east':
      return 'bg-red-600'; // Red
    case 'west':
      return 'bg-blue-600'; // Green
    case 'not-in-berlin':
      return 'bg-gray-700'; // Gray
    case 'error':
      return 'bg-gray-800'; // Dark gray
    case 'loading':
      return 'bg-gray-800'; // Dark gray
    case 'pending':
      return 'bg-gray-800'; // Dark gray
    default:
      return 'bg-gray-800';
  }
}
