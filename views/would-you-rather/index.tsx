import { useSoapboxRoomId } from "../../hooks";

export default function WouldYouRatherView() {
  const soapboxRoomId = useSoapboxRoomId();

  return (
    <main className="flex flex-col min-h-screen">
      <div className="p-4 flex justify-between items-center">
        <div className="text-title2 font-bold">Would You Rather</div>
      </div>
    </main>
  );
}
