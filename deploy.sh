#!/bin/bash

# Ensure we're in the right directory
cd /var/www/openresin || exit 1

# Pull latest changes
echo "Pulling latest changes..."
git pull origin main

# Build client and server
echo "Building client..."
NODE_ENV=production npm run build

echo "Building server..."
NODE_ENV=production npm run build:server

# Install production dependencies
echo "Installing dependencies..."
NODE_ENV=production npm ci --omit=dev

# Setup directories
echo "Setting up directories..."
mkdir -p dist/{public,server}

# Setup Nginx config if it doesn't exist
if [ ! -f /etc/nginx/sites-available/openresin.org ]; then
    echo "Setting up Nginx configuration..."
    mkdir -p /etc/nginx/sites-available
    cp nginx/website.conf /etc/nginx/sites-available/openresin.org
    ln -sf /etc/nginx/sites-available/openresin.org /etc/nginx/sites-enabled/
fi

# Setup systemd service
echo "Setting up systemd service..."
cat > /etc/systemd/system/openresin.service << EOL
[Unit]
Description=Open Resin Website
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/openresin
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/node dist/server/index.js
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOL

# Reload systemd and restart service
systemctl daemon-reload
systemctl enable openresin
systemctl restart openresin

# Reload Nginx
systemctl reload nginx

echo "Deployment complete!"