#!/bin/bash
set -e # Exit on error

# Check Node.js version first, since we'll need it for the build
required_node_version="18"
current_node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)

if [ "$current_node_version" -lt "$required_node_version" ]; then
    echo "Node.js version $required_node_version or higher is required"
    echo "Installing Node.js $required_node_version..."
    # Add NodeSource repository and install Node.js
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    apt-get install -y nodejs
fi

# Create website directory if it doesn't exist
echo "Setting up website directory..."
mkdir -p /var/www/openresin

# Clone or update repository
if [ ! -d "/var/www/openresin/.git" ]; then
    echo "Cloning repository..."
    # If this is first deployment, clone the repository
    git clone https://github.com/open-resin-alliance/website.git /var/www/openresin
    cd /var/www/openresin
else
    # If repository exists, update it
    cd /var/www/openresin
    echo "Pulling latest changes..."
    git pull origin main
fi

# Clean up old build
echo "Cleaning up old build..."
rm -rf dist/

# Install all dependencies (including dev dependencies needed for build)
echo "Installing dependencies..."
npm ci

# Build client and server
echo "Building client..."
NODE_ENV=production npm run build
echo "Building server..."
NODE_ENV=production npm run build:server

# Setup directories
echo "Setting up directories..."
mkdir -p dist/{public,server}

# Clean install production dependencies
echo "Installing production dependencies..."
rm -rf node_modules
NODE_ENV=production npm ci --omit=dev

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
echo "Restarting services..."
systemctl daemon-reload
systemctl enable openresin
systemctl restart openresin

# Reload Nginx
systemctl reload nginx

echo "Deployment complete!"