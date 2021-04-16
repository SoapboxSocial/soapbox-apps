import title from "title";
import getRandom from "./getRandom";

export default function obfuscateWord(word: string) {
  if (typeof word === "string") {
    const letters = Array.from(title(word));

    const randomCharacterIndex = getRandom(letters.length);

    const obfuscated = letters
      .map((char, index) => {
        if (index === randomCharacterIndex && char !== " ") return char;

        if (char === " ") return char;

        return "_";
      })
      .join("");

    return obfuscated;
  }

  return;
}
