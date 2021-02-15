import { useRouter } from "next/router";

export function useUser() {
  const { query } = useRouter();

  return {
    userID: query?.userID || null,
    userRole: query?.userRole || null,
  };
}
