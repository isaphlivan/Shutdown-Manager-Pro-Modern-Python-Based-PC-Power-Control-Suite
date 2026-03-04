const screenshot = require('screenshot-desktop');

async function test() {
    try {
        console.log('Taking screenshot...');
        const img = await screenshot({ format: 'png' });
        console.log('Success! Buffer size:', img.length);
    } catch (err) {
        console.error('Error taking screenshot:', err);
    }
}

test();
