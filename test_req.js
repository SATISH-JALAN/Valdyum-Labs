const http = require('http');

const data = JSON.stringify({
  deployer_wallet: 'GCRQ2VEGQQGDAA6E7B6O2JZYXM5QXQKKOSP2Y2UC255KF455UQJRU77D',
  agent_id: 'test',
  metadata_hash: 'abc',
  price_xlm: 1
});

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/agents/validate-deploy',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', d => {
    body += d;
  });
  res.on('end', () => {
    console.log(body);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
