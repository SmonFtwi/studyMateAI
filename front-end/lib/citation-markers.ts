interface Node {
  type: string;
  value?: string;
  url?: string;
  children?: Node[];
}

// Transform Markdown text nodes only, leaving code and existing links untouched.
export function citationMarkers() {
  return (tree: Node) => {
    function visit(node: Node) {
      if (
        ["code", "inlineCode", "link", "linkReference", "html"].includes(
          node.type,
        )
      )
        return;
      if (!node.children) return;
      node.children = node.children.flatMap((child) => {
        if (child.type !== "text" || !child.value) {
          visit(child);
          return [child];
        }
        const result: Node[] = [];
        let offset = 0;
        for (const match of Array.from(
          child.value.matchAll(/\[S([1-9]\d*)\]/g),
        )) {
          const start = match.index!;
          if (start > offset)
            result.push({
              type: "text",
              value: child.value.slice(offset, start),
            });
          result.push({
            type: "link",
            url: `#studymate-citation-S${match[1]}`,
            children: [{ type: "text", value: match[0] }],
          });
          offset = start + match[0].length;
        }
        if (offset < child.value.length)
          result.push({ type: "text", value: child.value.slice(offset) });
        return result;
      });
    }
    visit(tree);
  };
}
