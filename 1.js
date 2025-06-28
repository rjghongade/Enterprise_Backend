// 2-https-get.js
import https from 'https';

const url = 'https://techamica.com/ip_server_check/BlacklistedIp.txt';

https.get(url, (res) => {
  let data = '';
  res.setEncoding('utf8');

  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    console.log('Remote file contents:\n', data);
  });
}).on('error', err => {
  console.error('HTTPS request failed:', err);
});
