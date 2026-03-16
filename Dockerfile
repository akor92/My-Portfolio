# Step 1: Use the official Nginx image based on Alpine Linux
# Alpine is super lightweight (around 5MB!), which is a DevOps best practice.
FROM nginx:alpine

# Step 2: Copy your index.html file from your computer into the container
# Nginx automatically serves files located in this specific directory.
COPY index.html /usr/share/nginx/html/index.html

# Step 3: Tell Docker that this container will listen on port 80
EXPOSE 80
