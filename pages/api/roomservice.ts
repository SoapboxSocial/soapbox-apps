import type { NextApiRequest, NextApiResponse } from "next";

const apiKey = process.env.ROOMSERVICE_API_KEY;

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const body = req.body;
    const user = req.body.user;

    const resources = [
      {
        object: "room",
        reference: body.room,
        permission: "join",
      },
    ];

    if (!apiKey) {
      const error =
        "API key not set. Grab yours from https://app.roomservice.dev and add ROOMSERVICE_API_KEY=<your_api_key> to a .env file in this directory.";

      throw new Error(error);
    }

    const r = await fetch("https://super.roomservice.dev/provision", {
      method: "post",
      headers: {
        Authorization: `Bearer: ${process.env.ROOMSERVICE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: user,
        resources: resources,
      }),
    });

    const json = await r.json();

    console.log(json);

    res.status(200).json(json);
  } catch (error) {
    res.status(500).send(error);
  }
};
