const https = require('https');
const fs = require('fs');
https.get('https://feeds.npr.org/1001/rss.xml', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    fs.writeFileSync('/home/arong/yolinewsai/npr.xml', data);
  });
});
