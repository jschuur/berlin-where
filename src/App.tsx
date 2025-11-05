import { Coordinates } from '@/components/Coordinates';
import { EastWest, getBackgroundColorClass } from '@/components/EastWest';

import { useLocation } from '@/hooks/useLocation';

export default function App() {
  const { status, error, coordinates, district, requestPermission, isCheckingPermission } =
    useLocation();

  return (
    <div
      className={`flex relative justify-center items-center transition-colors duration-500 w-svw h-svh ${getBackgroundColorClass(
        status
      )}`}
    >
      <EastWest
        status={status}
        district={district}
        error={error}
        requestPermission={requestPermission}
        isCheckingPermission={isCheckingPermission}
      />
      {coordinates ? <Coordinates lat={coordinates.lat} lon={coordinates.lon} /> : <div>-</div>}
    </div>
  );
}
