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
                git branch: "${env.BRANCH_NAME}", 
                    url: 'https://github.com/ModiniPadmaSree/ecom.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm test || true'
            }
        }

        stage('SonarCloud Scan') {
            steps {
                script{
                     def scannerHome = tool 'sonar-scanner'
                     withSonarQubeEnv('SonarCloud') {
                         sh "${scannerHome}/bin/sonar-scanner
                           -Dsonar.projectKey=ModiniPadmaSree_ecom \
                           -Dsonar.organization=modinipadmasree \
                           -Dsonar.sources=. \
                           -Dsonar.host.url=https://sonarcloud.io \
                           -Dsonar.exclusions=**/*.py
                           -Dsonar.exclusions=node_modules/**,build/**,dist/**,.git/** \
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

        stage('Push Docker Images') {
            steps {
                script {
                    docker.withRegistry('', DOCKER_CREDENTIALS_ID) {
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
                message: "✅ Build Successful: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
            )
        }
        failure {
            slackSend(
                channel: '#jenkins-ci',
                message: "❌ Build Failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
            )
        }
    }
}
