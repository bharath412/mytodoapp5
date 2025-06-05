#!/bin/bash

# === CONFIGURATION ===
SERVER_IP="139.59.70.157"
REMOTE_USER="iot"
PROJECT_NAME="my-full-stack-app"
REMOTE_PATH="/home/$REMOTE_USER/$PROJECT_NAME"
IMAGE_NAME="myfullstackapp2"
CONTAINER_NAME="myfullstackapp-container"
HOST_PORT=9091
CONTAINER_PORT=8080

#  Prompt for sudo password once
read -s -p "Enter password for $REMOTE_USER@$SERVER_IP: " REMOTE_PASS
echo

#  Upload project (suppress file output)
echo " Uploading project to server..."
scp -rq ./ "$REMOTE_USER@$SERVER_IP:$REMOTE_PATH"

#  Start remote deployment
echo " Starting deployment on remote server..."

ssh "$REMOTE_USER@$SERVER_IP" /bin/bash << EOF
export SUDO_ASKPASS_SCRIPT="/tmp/askpass.sh"

# Write password to temporary askpass script
echo '#!/bin/bash' > \$SUDO_ASKPASS_SCRIPT
echo "echo '$REMOTE_PASS'" >> \$SUDO_ASKPASS_SCRIPT
chmod +x \$SUDO_ASKPASS_SCRIPT
export SUDO_ASKPASS=\$SUDO_ASKPASS_SCRIPT

cd "$REMOTE_PATH"

echo " Stopping and removing old container..."
sudo -A docker stop "$CONTAINER_NAME" 2>/dev/null || true
sudo -A docker rm "$CONTAINER_NAME" 2>/dev/null || true

echo "🧹 Removing old Docker image..."
sudo -A docker rmi "$IMAGE_NAME" 2>/dev/null || true

echo " Building new Docker image..."
sudo -A docker build -t "$IMAGE_NAME" . | tee docker_build.log

echo " Running new container..."
sudo -A docker run -d -p "$HOST_PORT:$CONTAINER_PORT" --name "$CONTAINER_NAME" "$IMAGE_NAME"

# Clean up askpass script
rm -f \$SUDO_ASKPASS_SCRIPT

echo " Deployment complete!"
echo " App is live at: http://$SERVER_IP:$HOST_PORT"
EOF
