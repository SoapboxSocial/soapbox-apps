export async function AuthFunction(params: {
  room: string;
  ctx: {
    userID: string;
  };
}) {
  const response = await fetch("/api/roomservice", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      room: params.room,
      user: params.ctx.userID,
    }),
  });

  if (response.status === 401) {
    throw new Error("Unauthorized!");
  }

  if (response.status !== 200) {
    throw await response.text();
  }

  const body = await response.json();

  console.log({
    user: body.user,
    resources: body.resources,
    token: body.token,
  });

  return {
    user: body.user,
    resources: body.resources,
    token: body.token,
  };
}
