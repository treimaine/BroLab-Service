const https = require('https');

const resendApiKey = 're_6P4CuZhX_Ymtk9DvRdb3XSrk8Uwem4Ztv';
const senderEmail = 'treigua@brolabentertainment.com';

const users = [
  {
    name: 'treigua',
    email: 'slemba2@yahoo.fr'
  },
  {
    name: 'Steve',
    email: 'treigua38000@gmail.com'
  },
  {
    name: 'Steve',
    email: 'brolabentertainment@gmail.com'
  }
];

const frictionMessage = (name) => `Hey ${name}!

Quick question — what would make you ready to upload your first beat to BroLab?

Any blockers with:
- Payment/checkout process?
- File upload/format?
- Pricing clarity?
- Feature missing?
- Onboarding unclear?

Just want to make sure we remove whatever's in the way. Reply and let me know!`;

let sentCount = 0;

users.forEach((user) => {
  const body = JSON.stringify({
    from: senderEmail,
    to: user.email,
    subject: `Quick question: what's blocking your first upload?`,
    html: `<p>${frictionMessage(user.name).replace(/\n/g, '<br>')}</p>`
  });

  const options = {
    hostname: 'api.resend.com',
    port: 443,
    path: '/emails',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      if (res.statusCode === 200 || res.statusCode === 201) {
        const response = JSON.parse(data);
        console.log(`✓ Friction analysis email sent to ${user.name} (${user.email})`);
        sentCount++;

        if (sentCount === users.length) {
          console.log(`\n✅ Friction discovery phase started!`);
          console.log(`Awaiting responses to identify blockers...`);
          console.log(`Timeline: Responses expected within 6-24 hours`);
        }
      } else {
        console.log(`✗ Error sending to ${user.name}: ${res.statusCode}`);
      }
    });
  });

  req.on('error', (e) => { console.error(`Error for ${user.email}:`, e.message); });
  req.write(body);
  req.end();
});

console.log('Sending friction analysis emails to 3 users...\n');
