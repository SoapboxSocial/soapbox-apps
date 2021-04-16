import { useMeasure } from "react-use";
import { useSession, useSoapboxRoomId } from "../../hooks";

export default function Debug() {
  const [ref, { width, height }] = useMeasure();

  const roomID = useSoapboxRoomId();
  const user = useSession();

  return (
    <main ref={ref} className="min-h-screen flex flex-col">
      <div className="flex-1 p-4 flex flex-col justify-center">
        <p className="text-title1 font-bold text-center">{`${width} x ${height}`}</p>
      </div>

      <div className="p-4">
        <ul className="w-full space-y-2 text-sm">
          <li className="flex justify-between">
            <p>
              <strong>roomID</strong>:
            </p>

            {roomID && <p>{roomID}</p>}
          </li>

          <li className="flex justify-between">
            <p>
              <strong>user</strong>:
            </p>

            {user && (
              <ul className="text-right">
                {Object.entries(user).map(([key, value]) => (
                  <li key={key}>
                    <strong>{key}</strong>: {value}
                  </li>
                ))}
              </ul>
            )}
          </li>
        </ul>
      </div>
    </main>
  );
}
