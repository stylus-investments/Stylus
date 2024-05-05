# Start in development mode
# Commands

# This will make this script executable
# chmod +x dev.sh

# This will run the development mode in docker :D
# ./dev.sh

# Stop and remove existing container
docker stop growpoint >/dev/null 2>&1
docker rm growpoint >/dev/null 2>&1

# Run the container
docker run -it \
  -p 3000:3000 \
  -v $(pwd):/usr/src/app \
  -v growpoint:/usr/src/app/node_modules \
  --name growpoint \
  growpoint