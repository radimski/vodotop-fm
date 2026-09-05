/* Real Siteverify + SMTP + PHP engine integration test. No production config is used. */
const http = require('http');
const net = require('net');
const { spawn } = require('child_process');
const path = require('path');

const messages = [];
let siteverifyRequests = 0;

const smtp = net.createServer((socket) => {
  let buffer = '';
  let data = false;
  let message = '';

  socket.setEncoding('utf8');
  socket.write('220 localhost test SMTP\r\n');
  socket.on('data', (chunk) => {
    buffer += chunk;
    while (buffer.includes('\r\n')) {
      const end = buffer.indexOf('\r\n');
      const line = buffer.slice(0, end);
      buffer = buffer.slice(end + 2);

      if (data) {
        if (line === '.') {
          messages.push(message);
          message = '';
          data = false;
          socket.write('250 queued\r\n');
        } else message += line + '\r\n';
        continue;
      }

      if (/^EHLO /i.test(line)) socket.write('250-localhost\r\n250 8BITMIME\r\n');
      else if (/^(MAIL FROM|RCPT TO):/i.test(line)) socket.write('250 ok\r\n');
      else if (/^DATA$/i.test(line)) {
        data = true;
        socket.write('354 end with dot\r\n');
      } else if (/^QUIT$/i.test(line)) {
        socket.write('221 bye\r\n');
        socket.end();
      } else socket.write('250 ok\r\n');
    }
  });
});

const siteverify = http.createServer((req, res) => {
  let body = '';
  req.setEncoding('utf8');
  req.on('data', (chunk) => { body += chunk; });
  req.on('end', () => {
    siteverifyRequests++;
    const params = new URLSearchParams(body);
    const success = params.get('secret') === 'test-turnstile-secret' && params.get('response') === 'good-token';
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(success
      ? { success: true, hostname: 'www.raftingoravec-pieniny.sk', action: 'booking', 'error-codes': [] }
      : { success: false, 'error-codes': ['invalid-input-response'] }));
  });
});

function decodedParts(message) {
  const parts = [];
  const re = /Content-Transfer-Encoding: base64\r\n\r\n([A-Za-z0-9+/=\r\n]+?)(?=--fe-)/g;
  let match;
  while ((match = re.exec(message))) {
    parts.push(Buffer.from(match[1].replace(/\s/g, ''), 'base64').toString('utf8'));
  }
  return parts.join('\n');
}

function finish(code, stdout, stderr) {
  smtp.close();
  siteverify.close();
  if (code !== 0) {
    process.stderr.write(stderr || stdout);
    process.exitCode = code || 1;
    return;
  }

  if (siteverifyRequests !== 2) throw new Error(`Expected 2 Siteverify calls, received ${siteverifyRequests}; honeypot may have leaked.`);
  if (messages.length !== 2) throw new Error(`Expected 2 messages, captured ${messages.length}.`);
  if (!/^To: info@raftingoravec-pieniny\.sk$/mi.test(messages[0])) throw new Error('Office notification recipient is wrong.');
  if (!/^To: customer@example\.test$/mi.test(messages[1])) throw new Error('Customer confirmation recipient is wrong.');
  if (!/^Auto-Submitted: auto-replied$/mi.test(messages[1])) throw new Error('Customer confirmation lacks loop protection.');
  if (!/^Reply-To: info@raftingoravec-pieniny\.sk$/mi.test(messages[1])) throw new Error('Customer reply does not go to the office.');

  const customerBody = decodedParts(messages[1]);
  if (!customerBody.includes('We have successfully received your booking request.')) throw new Error('English confirmation text is missing.');
  if (!customerBody.includes('Test Customer')) throw new Error('Booking summary is missing from customer confirmation.');
  // The greeting is a template ("Thank you, {meno}"). Checking the name is
  // somewhere in the mail was not enough — the summary table always contains
  // it, so the greeting shipped with the braces still in it.
  if (!customerBody.includes('Thank you, Test Customer')) throw new Error('Confirmation greeting did not get the name substituted.');
  const unfilled = customerBody.match(/\{[A-Za-z0-9_]+\}/);
  if (unfilled) throw new Error('Unreplaced placeholder in customer confirmation: ' + unfilled[0]);

  process.stdout.write(stdout);
  process.stdout.write('Siteverify accepted one valid challenge, rejected one invalid challenge, and honeypot bypassed external work.\n');
  process.stdout.write('SMTP captured one office notification and one customer confirmation; rejected traffic sent none.\n');
}

smtp.listen(0, '127.0.0.1', () => {
  siteverify.listen(0, '127.0.0.1', () => {
    const script = path.join(__dirname, 'test-form.php');
    const child = spawn('php', [script, String(smtp.address().port), String(siteverify.address().port)], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('close', (code) => finish(code, stdout, stderr));
  });
});
