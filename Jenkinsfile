pipeline {
    agent any // This tells Jenkins to run on any available node/executor
    
    environment {
        // ⚠️ REPLACE 'yourusername' with your actual Docker Hub username!
        DOCKERHUB_USER = 'akor92'
        IMAGE_NAME = 'devops-portfolio'
    }

    stages {
        stage('Build Docker Image') {
            steps {
                echo 'Building the Docker image...'
                // This builds the image and tags it with your Docker Hub info
                sh 'docker build -t ${DOCKERHUB_USER}/${IMAGE_NAME}:latest .'
            }
        }
        
        stage('Push to Docker Hub') {
            steps {
                echo 'Logging in and pushing to Docker Hub...'
                
                // This securely grabs your Docker Hub credentials stored in Jenkins
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', passwordVariable: 'dckr_pat_HyBqoOXmrjtHeDk4UcafrdAoxfE', usernameVariable: 'akor92')]) {
                    
                    // We pipe the password into docker login for security (avoids leaving passwords in logs)
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                    
                    // Push the shiny new image to your public registry
                    sh 'docker push ${DOCKERHUB_USER}/${IMAGE_NAME}:latest'
                }
            }
        }
    }
}
