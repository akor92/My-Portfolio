pipeline {
    agent any 
    
    environment {
        DOCKERHUB_USER = 'akor92'
        IMAGE_NAME = 'devops-portfolio'
    }

    stages {
        stage('Build Docker Image') {
            steps {
                echo 'Building the Docker image...'
                sh "docker build -t ${DOCKERHUB_USER}/${IMAGE_NAME}:latest ."
            }
        }
        
        stage('Push to Docker Hub') {
            steps {
                echo 'Logging in and pushing to Docker Hub...'
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER')]) {
                    sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
                    sh "docker push ${DOCKERHUB_USER}/${IMAGE_NAME}:latest"
                }
            }
        }
        
        // 🚀 THE NEW CD STAGE 🚀
        stage('Deploy to Kubernetes') {
            steps {
                echo 'Deploying to the local Kubernetes cluster...'
                
                // 1. Tell K8s to apply your infrastructure blueprint
                sh 'kubectl apply -f deployment.yaml'
                
                // 2. The DevOps Secret Sauce: Force a restart!
                sh 'kubectl rollout restart deployment portfolio-deployment'
            }
        }
    }
}
