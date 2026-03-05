pipeline {
    agent any
    
    tools {
        nodejs "node20"
    }
    environment {
        DOCKER_IMAGE_FRONTEND = "modinipadmasree/ecom-frontend"
        DOCKER_IMAGE_BACKEND  = "modinipadmasree/ecom-backend"
        DOCKER_CREDENTIALS_ID = "dockerhub-creds"
        SONAR_TOKEN = credentials('sonar-token')
    }
    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }
        stage('Install Backend Dependencies') {
            steps {
                sh 'cd server && npm install'
            }
        }
        stage('Run Backend Tests') {
            steps {
                sh 'cd server && npm test'
            }
        }
        stage('SonarCloud Scan') {
            steps {
                script {
                    def scannerHome = tool 'sonar-scanner'
                    withSonarQubeEnv('SonarCloud') {
                        sh """
                        ${scannerHome}/bin/sonar-scanner \
                        -Dsonar.projectKey=ModiniPadmaSree_ecom \
                        -Dsonar.organization=modinipadmasree \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=https://sonarcloud.io \
                        -Dsonar.login=${SONAR_TOKEN} \
                        -Dsonar.exclusions=**/node_modules/**,build/**,dist/**,.git/**
                        """
                    }
                }
            }
        }
        stage('Build Docker Images') {
            steps {
                script {
                    docker.build("${DOCKER_IMAGE_FRONTEND}:${BUILD_NUMBER}", "./client")
                    docker.build("${DOCKER_IMAGE_BACKEND}:${BUILD_NUMBER}", "./server")
                }
            }
        }
        stage('Trivy Image Scan') {
            steps {
                script {
                    sh """
                    trivy image \
                        --exit-code 1 \
                        --severity CRITICAL \
                        --no-progress \
                        ${DOCKER_IMAGE_BACKEND}:${BUILD_NUMBER}
                    """
                    sh """
                    trivy image \
                        --exit-code 1 \
                        --severity CRITICAL \
                        --no-progress \
                        ${DOCKER_IMAGE_FRONTEND}:${BUILD_NUMBER}
                    """
                }
            }
        }
        stage('Push Docker Images') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', DOCKER_CREDENTIALS_ID) {
                        docker.image("${DOCKER_IMAGE_FRONTEND}:${BUILD_NUMBER}").push()
                        docker.image("${DOCKER_IMAGE_BACKEND}:${BUILD_NUMBER}").push()
                    }
                }
            }
        }
    }
    post {
        success {
            slackSend(
                channel: '#jenkins-ci',
                color: 'good',
                message: "✅ SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER} - All security scans passed!"
            )
        }
        failure {
            slackSend(
                channel: '#jenkins-ci',
                color: 'danger',
                message: "❌ FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER} - Check security scan results!"
            )
        }
    }
}
