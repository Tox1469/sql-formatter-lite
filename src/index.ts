const KEYWORDS = [
  "SELECT", "FROM", "WHERE", "AND", "OR", "INNER JOIN", "LEFT JOIN", "RIGHT JOIN",
  "JOIN", "ON", "GROUP BY", "ORDER BY", "HAVING", "LIMIT", "OFFSET", "INSERT INTO",
  "VALUES", "UPDATE", "SET", "DELETE FROM", "CREATE TABLE", "ALTER TABLE", "DROP TABLE",
  "UNION", "UNION ALL",
];

const NEWLINE_BEFORE = new Set([
  "FROM", "WHERE", "AND", "OR", "INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "JOIN",
  "GROUP BY", "ORDER BY", "HAVING", "LIMIT", "OFFSET", "VALUES", "SET", "UNION", "UNION ALL",
]);

export interface FormatOptions {
  indent?: string;
  uppercase?: boolean;
}

export function format(sql: string, opts: FormatOptions = {}): string {
  const indent = opts.indent ?? "  ";
  const upper = opts.uppercase ?? true;
  let s = sql.replace(/\s+/g, " ").trim();

  const sorted = [...KEYWORDS].sort((a, b) => b.length - a.length);
  for (const kw of sorted) {
    const re = new RegExp(`\\b${kw.replace(/ /g, "\\s+")}\\b`, "gi");
    s = s.replace(re, upper ? kw : kw.toLowerCase());
  }

  let out = "";
  let i = 0;
  while (i < s.length) {
    let matched = false;
    for (const kw of sorted) {
      const target = upper ? kw : kw.toLowerCase();
      if (s.substr(i, target.length).toUpperCase() === kw) {
        if (NEWLINE_BEFORE.has(kw) && out.length) out += "\n";
        out += target;
        i += target.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      out += s[i];
      i++;
    }
  }

  const lines = out.split("\n");
  return lines
    .map((line, idx) => {
      const trimmed = line.trim();
      if (idx === 0) return trimmed;
      const firstWord = trimmed.split(/\s+/)[0].toUpperCase();
      if (["AND", "OR"].includes(firstWord)) return indent + indent + trimmed;
      return indent + trimmed;
    })
    .join("\n")
    .replace(/,\s*/g, ",\n" + indent)
    .replace(/;\s*$/, ";");
}

export function minify(sql: string): string {
  return sql.replace(/\s+/g, " ").trim();
}
