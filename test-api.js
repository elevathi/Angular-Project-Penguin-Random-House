/**
 * Quick API Test Script
 * Run with: node test-api.js
 */

const https = require('https');

const API_KEY = 'wfge9j2w6km6w5nfqvyuzk7d';
const BASE_URL = 'api.penguinrandomhouse.com';

function testEndpoint(path, description) {
  return new Promise((resolve, reject) => {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`Testing: ${description}`);
    console.log(`Endpoint: https://${BASE_URL}${path}`);
    console.log(`${'='.repeat(80)}\n`);

    const options = {
      hostname: BASE_URL,
      path: path,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`Status Code: ${res.statusCode}`);
        console.log(`Headers:`, JSON.stringify(res.headers, null, 2));

        try {
          const json = JSON.parse(data);
          console.log('\nResponse Structure:');
          console.log(JSON.stringify(json, null, 2).substring(0, 2000));
          if (JSON.stringify(json).length > 2000) {
            console.log('\n... (truncated for readability)');
          }
          resolve({ success: true, data: json });
        } catch (e) {
          console.log('\nRaw Response (not JSON):');
          console.log(data.substring(0, 1000));
          resolve({ success: false, error: 'Not JSON', data });
        }
      });
    });

    req.on('error', (error) => {
      console.error('Request Error:', error.message);
      reject(error);
    });

    req.end();
  });
}

async function runTests() {
  console.log('Starting PRH API Tests...\n');

  try {
    // Test 1: List Authors
    await testEndpoint(
      `/resources/v2/domains/PRH.US/authors?start=0&rows=5&api_key=${API_KEY}`,
      'List Authors (first 5)'
    );

    await new Promise(r => setTimeout(r, 1000));

    // Test 2: Search Authors by Last Initial
    await testEndpoint(
      `/resources/v2/domains/PRH.US/authors?authorLastInitial=P&start=0&rows=5&api_key=${API_KEY}`,
      'Search Authors with Last Name starting with P'
    );

    await new Promise(r => setTimeout(r, 1000));

    // Test 3: List Titles
    await testEndpoint(
      `/resources/v2/domains/PRH.US/titles?start=0&rows=5&api_key=${API_KEY}`,
      'List Titles (first 5)'
    );

    await new Promise(r => setTimeout(r, 1000));

    // Test 4: Get specific author (example ID: 2001)
    await testEndpoint(
      `/resources/v2/domains/PRH.US/authors/2001?api_key=${API_KEY}`,
      'Get Author by ID (2001)'
    );

    console.log('\n' + '='.repeat(80));
    console.log('All tests completed!');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('\nTest Suite Failed:', error);
  }
}

runTests();
