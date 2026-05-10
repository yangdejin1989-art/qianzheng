const http = require('http');

const carousels = [
  { imageUrl: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1200', position: 'center', order: 0, visible: true },
  { imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200', position: 'center', order: 1, visible: true },
  { imageUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f905?w=1200', position: 'center', order: 2, visible: true },
  { imageUrl: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200', position: 'center', order: 3, visible: true },
];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function addCarousel(data, retry = 3) {
  for (let attempt = 0; attempt < retry; attempt++) {
    return await new Promise((resolve, reject) => {
      const jsonData = JSON.stringify(data);
      const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/carousels',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(jsonData),
        },
      };
      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          console.log(`  Status: ${res.statusCode}`, body.substring(0, 200));
          if (res.statusCode === 200) {
            resolve(JSON.parse(body));
          } else if (body.includes('not primary')) {
            console.log(`  MongoDB not ready, retrying in 3s...`);
            sleep(3000).then(() => resolve(addCarousel(data)));
          } else {
            reject(new Error(body));
          }
        });
      });
      req.on('error', (e) => {
        console.log(`  Request error: ${e.message}, retrying...`);
        sleep(3000).then(() => resolve(addCarousel(data)));
      });
      req.write(jsonData);
      req.end();
    });
  }
}

async function main() {
  console.log('Waiting 5s for MongoDB to stabilize...');
  await sleep(5000);
  for (let i = 0; i < carousels.length; i++) {
    console.log(`Adding carousel ${i + 1}...`);
    await addCarousel(carousels[i]);
  }
  console.log('All done!');
}

main().catch(console.error);