import { useEffect, useState } from "react";

export function Typewriter({ words, className }: { words: string[]; className?: string }) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[index % words.length] ?? "";
    const done = !deleting && text === current;
    const empty = deleting && text === "";

    const timeout = setTimeout(
      () => {
        if (done) {
          setDeleting(true);
          return;
        }
        if (empty) {
          setDeleting(false);
          setIndex((i) => (i + 1) % words.length);
          return;
        }
        setText(deleting ? current.slice(0, text.length - 1) : current.slice(0, text.length + 1));
      },
      done ? 1800 : deleting ? 40 : 80,
    );

    return () => clearTimeout(timeout);
  }, [text, deleting, index, words]);

  return (
    <span className={className}>
      {text}
      <span className="ml-1 inline-block w-[3px] animate-pulse bg-accent align-middle" style={{ height: "0.9em" }} />
    </span>
  );
}
