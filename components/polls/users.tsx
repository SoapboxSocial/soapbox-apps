import { usePresence } from "@roomservice/react";
import { useEffect } from "react";
import { useUser } from "../../hooks";

export default function Users() {
  const { userRole } = useUser();

  const [joined, joinedClient] = usePresence("soapbox-apps-poll-1", "poll");

  useEffect(() => {
    joinedClient.set(userRole);
  }, []);

  return (
    <ul className="flex">
      {Object.keys(joined).map((joinedUserId, i) => (
        <li
          key={i}
          className={`flex items-center justify-center h-8 w-8 rounded-full ring-4 ring-gray-100 dark:ring-gray-800 ${
            joined[joinedUserId] === "admin"
              ? "bg-purple-500 text-white"
              : "bg-gray-300"
          }`}
        >
          {joinedUserId}
        </li>
      ))}
    </ul>
  );
}
