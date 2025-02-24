const Service = require('node-windows').Service;

const svc = new Service({
    name: "yst-cus-hh",
    description: "YST Customize Handheld",
    script: "C:\\Users\\admindome\\Desktop\\Project - GitLap\\yst-cus-hh\\index.js"
});

svc.on('install', async function() {
    svc.start();
});

svc.install();