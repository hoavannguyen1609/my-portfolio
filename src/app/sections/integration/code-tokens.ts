export interface Token {
  text: string;
  kind: 'plain' | 'comment' | 'keyword' | 'call' | 'annotation';
}

const KEYWORDS = /^(new|public|private|void|return|final|class|if|boolean|true|false)$/;

/** Tô màu tối giản cho đoạn Java mẫu: chú thích, từ khoá, annotation, lời gọi hàm. */
export function tokenize(line: string): Token[] {
  const tokens: Token[] = [];
  const commentAt = line.indexOf('//');
  const code = commentAt >= 0 ? line.slice(0, commentAt) : line;
  const parts = code.split(/(\s+|[(){};.,!&<>])/).filter(Boolean);
  parts.forEach((part, i) => {
    let kind: Token['kind'] = 'plain';
    if (part.startsWith('@')) kind = 'annotation';
    else if (KEYWORDS.test(part)) kind = 'keyword';
    else if (/^[a-z]\w*$/.test(part) && parts[i + 1] === '(') kind = 'call';
    tokens.push({ text: part, kind });
  });
  if (commentAt >= 0) tokens.push({ text: line.slice(commentAt), kind: 'comment' });
  return tokens;
}

export function tokenClass(kind: Token['kind']): string {
  switch (kind) {
    case 'comment': return 'text-white/40 italic';
    case 'keyword': return 'text-[#ff7b88]';
    case 'annotation': return 'text-[#febc2e]';
    case 'call': return 'text-[#5ef0d3]';
    default: return '';
  }
}
