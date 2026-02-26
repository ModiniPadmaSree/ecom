pipeline {
    agent any


    environment {
        DOCKER_IMAGE_FRONTEND = "modinipadmasree/ecom-frontend"
        DOCKER_IMAGE_BACKEND  = "modinipadmasree/ecom-backend"
        DOCKER_CREDENTIALS_ID = "dockerhub-creds"
        SONAR_TOKEN = credentials('sonar-token')
    }
    tools {
        nodejs "node20"
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
                -Dsonar.login=$SONAR_TOKEN
                """
            }
        }
    }
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
                withSonarQubeEnv('SonarCloud') {
                    sh '''
                    sonar-scanner \
                      -Dsonar.projectKey=ModiniPadmaSree_ecom \
                      -Dsonar.organization=modinipadmasree \
                      -Dsonar.sources=. \
                      -Dsonar.host.url=https://sonarcloud.io \
                      -Dsonar.login=$SONAR_TOKEN
                    '''
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    docker.build("${DOCKER_IMAGE_FRONTEND}:${BUILD_NUMBER}", "./frontend")
                    docker.build("${DOCKER_IMAGE_BACKEND}:${BUILD_NUMBER}", "./backend")
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
        withCredentials([string(credentialsId: 'slack-webhook', variable: 'SLACK_URL')]) {
            sh """
            curl -X POST -H "Content-type: application/json" \
            --data '{"text":"✅ Build Success: ${JOB_NAME} #${BUILD_NUMBER}"}' \
            $SLACK_URL
            """
        }
    }

    failure {
        withCredentials([string(credentialsId: 'slack-webhook', variable: 'SLACK_URL')]) {
            sh """
            curl -X POST -H "Content-type: application/json" \
            --data '{"text":"❌ Build Failed: ${JOB_NAME} #${BUILD_NUMBER}"}' \
            $SLACK_URL
            """
        }
    }
}
}
