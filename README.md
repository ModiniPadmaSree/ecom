# E-Commerce Application with CI Automation

This repository contains the source code and CI pipeline configuration for the E-Commerce application.

The project demonstrates:
- Application development using MERN stack
- CI automation using Jenkins
- Docker image build and push
- SonarQube security and code quality scanning
- Slack notifications for pipeline status
- Automated integration with GitOps deployment repository

---

# Project Overview

The application source code is maintained in this repository.

Whenever code changes are pushed:
- Jenkins pipeline automatically triggers
- Application is built and tested
- SonarQube performs security/code quality analysis
- Docker image is created and pushed to Docker Hub
- Slack notifications are sent
- Kubernetes deployment repository (`ecom-k8s`) is updated with the latest image tag

---

# CI Workflow

```text
Developer Commit
        │
        ▼
GitHub Repository
        │
        ▼
Jenkins Pipeline Trigger
        │
        ├── Build Application
        ├── Run Tests
        ├── SonarQube Scan
        ├── Build Docker Image
        ├── Push Docker Image to Docker Hub
        └── Slack Notification
        │
        ▼
Update Image Tag in ecom-k8s Repository
```

---

# Technologies Used

- React.js
- Node.js
- Express.js
- MongoDB
- Docker
- Jenkins
- SonarQube
- Docker Hub
- Slack
- GitHub

---

# Repository Structure

```text
ecom/
│
├── frontend/
├── backend/
├── Jenkinsfile
├── Dockerfile
├── package.json
└── README.md
```

---

# Jenkins Pipeline Features

The Jenkins pipeline automates:

- Application build
- Automated testing
- Docker image creation
- Docker image push to Docker Hub
- SonarQube scanning
- Slack notifications
- Deployment trigger workflow

---

# SonarQube Integration

SonarQube is integrated into the Jenkins pipeline for:
- Static code analysis
- Security scanning
- Code quality checks
- Vulnerability detection

---

# Docker Workflow

The pipeline builds Docker images and pushes them to Docker Hub.

Example image tags:

```text
ecommerce-app:v1
ecommerce-app:v2
```

---

# Slack Notifications

Slack integration is used to notify:
- Pipeline success
- Pipeline failure
- Build status updates

---

# Integration with GitOps Deployment

After successful CI:
- Jenkins updates the image tag in the `ecom-k8s` repository
- Argo CD detects the change
- Kubernetes deployment is synchronized automatically

Deployment manifests are maintained in:

```text
https://github.com/ModiniPadmaSree/ecom-k8s
```

---

# Running Application Locally

## Install Dependencies

```bash
npm install
```

---

## Start Frontend

```bash
npm start
```

---

## Start Backend

```bash
npm run server
```

---

# Learning Outcomes

This project demonstrates:
- CI pipeline automation
- Docker image lifecycle management
- SonarQube integration
- Jenkins pipeline creation
- Slack notification integration
- GitOps deployment workflow integration

---

# Repository

```text
https://github.com/ModiniPadmaSree/ecom
```
