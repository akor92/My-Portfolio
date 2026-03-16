pipeline {
    agent any 
    
    environment {
        // Your specific Docker Hub username and image name
        DOCKERHUB_USER = 'akor92'
        IMAGE_NAME = 'devops-portfolio'
    }

    stages {
        stage('Build Docker Image') {
            steps {
                echo 'Building the Docker image...'
                // Double quotes are okay here because we are using variables from the environment block above
                sh "docker build -t ${DOCKERHUB_USER}/${IMAGE_NAME}:latest ."
            }
        }
        
        stage('Push to Docker Hub') {
            steps {
                echo 'Logging in and pushing to Docker Hub...'
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER')]) {
                    // ⚠️ Single quotes are MANDATORY here so the terminal reads the secret variables!
                    sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
                    
                    // Pushing the final image
                    sh "docker push ${DOCKERHUB_USER}/${IMAGE_NAME}:latest"
                }
            }
        }
    }
}
