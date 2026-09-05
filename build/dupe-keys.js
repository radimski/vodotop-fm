/* Duplicate object keys in the content files, caught at build time.
 *
 * JavaScript does not consider `{ email: 'E-mail', email: 'Zadajte…' }` an
 * error — not even in strict mode. The last one silently wins. That is exactly
 * how contact.form ended up with its e-mail and date FIELD LABELS rendering as
 * validation messages on the live site in all three languages: the label keys
 * and the data-msg-* keys shared one flat object and collided on `email` and
 * `date`.
 *
 * The messages now live in a nested `msg` object, so those two cannot collide
 * again. This exists for the next pair nobody has thought of yet: `require`
 * hands back the already-collapsed object, so the only place the duplicate is
 * still visible is the source text.
 *
 * Deliberately a small scanner rather than a real parser. It reads the source
 * character by character, skips comments and string bodies so prose cannot be
 * mistaken for syntax, and records a key only when the token before it is `{`
 * or `,` inside an object literal — which is the one position an object key can
 * occupy, and keeps ternaries and labels from registering as keys.
 */

/**
 * @param {string} src the file's source text
 * @returns {Array<{key: string, first: number, second: number, path: string}>}
 */
function findDuplicateKeys(src) {
  const dupes = [];
  // Each frame is one nesting level. Only '{' frames can hold keys; '[' and '('
  // frames are pushed too so their closers pop the right thing.
  const stack = [{ type: '{', keys: new Map(), name: '' }];
  const n = src.length;

  let i = 0;
  let line = 1;
  let prevSig = '{'; // last significant token, so we know where a key may start

  const isIdentStart = (c) => /[A-Za-z_$]/.test(c);
  const isIdentPart = (c) => /[A-Za-z0-9_$]/.test(c);

  /* Advances past a quoted string and returns its contents. Handles escapes so
   * a string ending in a backslash cannot swallow the rest of the file. */
  const readQuoted = (quote) => {
    let out = '';
    i++; // opening quote
    while (i < n && src[i] !== quote) {
      if (src[i] === '\\') {
        out += src[i + 1];
        i += 2;
        continue;
      }
      if (src[i] === '\n') line++;
      out += src[i];
      i++;
    }
    i++; // closing quote
    return out;
  };

  /* Template literals are skipped whole, interpolations included: `${...}` can
   * contain braces and quotes, so the only safe thing is to count depth until
   * the matching backtick. Nothing in the content files declares object keys
   * inside an interpolation. */
  const skipTemplate = () => {
    i++; // opening backtick
    let depth = 0;
    while (i < n) {
      const c = src[i];
      if (c === '\\') { i += 2; continue; }
      if (c === '\n') { line++; i++; continue; }
      if (depth === 0 && c === '`') { i++; return; }
      if (c === '$' && src[i + 1] === '{') { depth++; i += 2; continue; }
      if (depth > 0 && c === '{') depth++;
      if (depth > 0 && c === '}') depth--;
      i++;
    }
  };

  const record = (key, keyLine) => {
    const frame = stack[stack.length - 1];
    if (frame.type !== '{') return;
    if (frame.keys.has(key)) {
      dupes.push({
        key,
        first: frame.keys.get(key),
        second: keyLine,
        path: frame.name || '(top level)',
      });
      return;
    }
    frame.keys.set(key, keyLine);
  };

  while (i < n) {
    const c = src[i];

    if (c === '\n') { line++; i++; continue; }
    if (c === ' ' || c === '\t' || c === '\r') { i++; continue; }

    if (c === '/' && src[i + 1] === '/') {
      while (i < n && src[i] !== '\n') i++;
      continue;
    }
    if (c === '/' && src[i + 1] === '*') {
      i += 2;
      while (i < n && !(src[i] === '*' && src[i + 1] === '/')) {
        if (src[i] === '\n') line++;
        i++;
      }
      i += 2;
      continue;
    }

    if (c === '`') { skipTemplate(); prevSig = 'value'; continue; }

    if (c === "'" || c === '"') {
      const startLine = line;
      const canBeKey = prevSig === '{' || prevSig === ',';
      const value = readQuoted(c);
      // A string is a key only if a colon follows it.
      let j = i;
      while (j < n && /\s/.test(src[j])) j++;
      if (canBeKey && src[j] === ':') record(value, startLine);
      prevSig = 'value';
      continue;
    }

    if (c === '{' || c === '[' || c === '(') {
      // Name the frame after the key that opened it, so the error message can
      // say which object the duplicate is in.
      const name = c === '{' && typeof prevSig === 'object' ? prevSig.key : '';
      stack.push({ type: c, keys: new Map(), name });
      prevSig = c;
      i++;
      continue;
    }

    if (c === '}' || c === ']' || c === ')') {
      if (stack.length > 1) stack.pop();
      prevSig = 'value';
      i++;
      continue;
    }

    if (c === ',') { prevSig = ','; i++; continue; }

    if (isIdentStart(c)) {
      const startLine = line;
      const canBeKey = prevSig === '{' || prevSig === ',';
      let word = '';
      while (i < n && isIdentPart(src[i])) { word += src[i]; i++; }

      let j = i;
      while (j < n && /\s/.test(src[j])) j++;

      if (canBeKey && src[j] === ':') {
        record(word, startLine);
        // Remember the key so a '{' opening right after it can borrow the name.
        prevSig = { key: word };
        i = j + 1;
        continue;
      }
      prevSig = 'value';
      continue;
    }

    prevSig = c === ':' ? ':' : 'value';
    i++;
  }

  return dupes;
}

/** Throws with every duplicate listed, rather than only the first. */
function assertNoDuplicateKeys(files, fs) {
  const problems = [];

  for (const file of files) {
    for (const d of findDuplicateKeys(fs.readFileSync(file, 'utf8'))) {
      const name = file.split(/[\\/]/).pop();
      problems.push(
        `  ${name}: "${d.key}" is declared twice in ${d.path} ` +
        `(line ${d.first} and line ${d.second}) — the second one silently wins`
      );
    }
  }

  if (problems.length) {
    throw new Error(
      'Duplicate keys in the content files:\n' + problems.join('\n') +
      '\n\nJavaScript keeps the last one and reports nothing, so this would ' +
      'have shipped. Rename one of them or nest them in separate objects.'
    );
  }
}

module.exports = { findDuplicateKeys, assertNoDuplicateKeys };
