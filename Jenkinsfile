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
        stage('Update Image Tag in Helm Chart') {
            when {
                branch 'main'
            }
            steps {
                script {
                    withCredentials([usernamePassword(
                        credentialsId: 'github-token',
                        usernameVariable: 'GIT_USER',
                        passwordVariable: 'GIT_TOKEN'
                    )]) {
                        // ✅ Step 1 - install yq (single quotes - no variable interpolation)
                        sh '''
                        sudo wget -qO /usr/local/bin/yq https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64
                        sudo chmod +x /usr/local/bin/yq
                        '''

                        // ✅ Step 2 - update and push (double quotes - needs variables)
                        sh """
                        git clone https://${GIT_USER}:${GIT_TOKEN}@github.com/ModiniPadmaSree/ecom-k8s.git
                        cd ecom-k8s
                        yq e -i '.backend.image = "modinipadmasree/ecom-backend:${BUILD_NUMBER}"' ecom-chart/values.yaml
                        yq e -i '.frontend.image = "modinipadmasree/ecom-frontend:${BUILD_NUMBER}"' ecom-chart/values.yaml
                        git config user.email "modinisree@gmail.com"
                        git config user.name "ModiniPadmaSree"
                        git add ecom-chart/values.yaml
                        git commit -m "Update images to ${BUILD_NUMBER}"
                        git push https://${GIT_USER}:${GIT_TOKEN}@github.com/ModiniPadmaSree/ecom-k8s.git main
                        """
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
                message: "✅ SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER} - Branch: ${env.BRANCH_NAME} - Image: :${env.BUILD_NUMBER}!"
            )
        }
        failure {
            slackSend(
                channel: '#jenkins-ci',
                color: 'danger',
                message: "❌ FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER} - Branch: ${env.BRANCH_NAME}"
            )
        }
    }
}
