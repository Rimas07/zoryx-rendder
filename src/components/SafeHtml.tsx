import parse from "html-react-parser";
import DOMPurify from "isomorphic-dompurify";

export default function SafeHtml({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p",
      "h2",
      "h3",
      "ul",
      "ol",
      "li",
      "br",
      "strong",
      "em",
      "a",
    ],
    ALLOWED_ATTR: ["href", "target", "rel"],
  });
  return <div className={className}>{parse(clean)}</div>;
}
