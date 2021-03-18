import { NextApiRequest, NextApiResponse } from "next";

export type Question = {
  category: string;
  type: "boolean";
  difficulty: "easy" | "medium" | "hard";
  question: string;
  correct_answer: "True" | "False";
  incorrect_answers: ["True" | "False"];
};

type Data = {
  /**
   * **Code 0**: Success Returned results successfully.
   *
   * **Code 1**: No Results Could not return results. The API doesn't have enough questions for your query. (Ex. Asking for 50 Questions in a Category that only has 20.)
   *
   * **Code 2**: Invalid Parameter Contains an invalid parameter. Arguements passed in aren't valid. (Ex. Amount = Five)
   *
   * **Code 3**: Token Not Found Session Token does not exist.
   *
   * **Code 4**: Token Empty Session Token has returned all possible questions for the specified query. Resetting the Token is necessary.
   */
  response_code: 0 | 1 | 2 | 3 | 4;
  results: Question[];
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const r = await fetch(`https://opentdb.com/api.php?amount=50&type=boolean`);

    const { results }: Data = await r.json();

    return res.status(200).json({
      success: true,
      results,
    });
  } catch (error) {
    console.log(error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
