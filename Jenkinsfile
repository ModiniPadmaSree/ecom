pipeline {
    agent any
    
    tools {
        nodejs "node20" // Make sure this NodeJS installation exists in Jenkins
    }

    environment {
        DOCKER_IMAGE_FRONTEND = "modinipadmasree/ecom-frontend"
        DOCKER_IMAGE_BACKEND  = "modinipadmasree/ecom-backend"
        DOCKER_CREDENTIALS_ID = "dockerhub-creds"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: "${env.BRANCH_NAME}", 
                    url: 'https://github.com/ModiniPadmaSree/ecom.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                // Install backend
                dir('server') {
                    sh 'npm install'
                }
                // Install frontend
                dir('client') {
                    sh 'npm install'
                }
            }
        }

        stage('Run Tests') {
            steps {
                dir('server') {
                    sh 'npm test || true'
                }
                dir('client') {
                    sh 'npm test || true'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    docker.build("${DOCKER_IMAGE_BACKEND}:${BUILD_NUMBER}", "./server")
                    docker.build("${DOCKER_IMAGE_FRONTEND}:${BUILD_NUMBER}", "./client")
                }
            }
        }

        stage('Push Docker Images') {
            steps {
                script {
                    docker.withRegistry('', DOCKER_CREDENTIALS_ID) {
                        docker.image("${DOCKER_IMAGE_BACKEND}:${BUILD_NUMBER}").push()
                        docker.image("${DOCKER_IMAGE_FRONTEND}:${BUILD_NUMBER}").push()
                    }
                }
            }
        }
    }

    post {
        always {
            cleanWs() // clean workspace after every build
        }
    }
}
