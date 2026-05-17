export function renderMarkdown(text: string) {
  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const renderList = (lines: string[]) => {
    let html = "<ul>";
    const stack: number[] = [0];
    let openedLi = false;

    lines.forEach((rawLine) => {
      const match = rawLine.match(/^(\s*)[-*]\s+(.+)$/);
      if (!match) return;

      const indent = match[1].length;
      const content = match[2].trim();
      const prevIndent = stack[stack.length - 1];

      if (indent > prevIndent) {
        html += "<ul>";
        stack.push(indent);
      } else {
        if (openedLi) html += "</li>";

        while (stack.length > 1 && indent < stack[stack.length - 1]) {
          html += "</ul></li>";
          stack.pop();
        }
      }

      html += `<li>${content}`;
      openedLi = true;
    });

    if (openedLi) html += "</li>";

    while (stack.length > 1) {
      html += "</ul></li>";
      stack.pop();
    }

    html += "</ul>";
    return html;
  };

  let html = escapeHtml(text.trim());

  html = html.replace(
    /\[(.+?)\]\((.+?)\)/g,
    '<a href="$2" target="_blank" rel="noreferrer" class="underline text-cyan-300">$1</a>',
  );

  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/(^|[^*])\*(?!\s)(.+?)(?<!\s)\*/g, "$1<em>$2</em>");

  const blocks = html.split(/\n{2,}/);

  html = blocks
    .map((block) => {
      const lines = block.split("\n");
      const isList = lines.every((line) => /^\s*[-*]\s+/.test(line));

      if (isList) {
        return renderList(lines);
      }

      return `<p>${lines.join("<br/>")}</p>`;
    })
    .join("");

  return html;
}
