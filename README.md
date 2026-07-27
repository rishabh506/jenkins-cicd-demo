# Jenkins CI/CD Pipeline Demo

A simple Node.js application with an automated Jenkins pipeline that builds, tests, and deploys the app using Docker.

## Objective

Set up a basic Jenkins pipeline to automate the process of building and deploying an application, demonstrating a fundamental CI/CD workflow.

## Tools Used

- **Jenkins** (running via Docker)
- **Docker** (for building and running the application container)
- **GitHub** (source control and pipeline trigger)
- **Node.js** (sample application)

## Project Structure

```
.
├── app.js           # Simple Node.js HTTP server
├── package.json     # App metadata and scripts
├── Dockerfile        # Docker build instructions
├── Jenkinsfile       # Jenkins pipeline definition
└── README.md
```

## How It Works

The `Jenkinsfile` defines a declarative pipeline with four stages:

1. **Checkout** — Pulls the latest code from the GitHub repository.
2. **Build** — Builds a Docker image of the application.
3. **Test** — Runs the app's test script inside a temporary container.
4. **Deploy** — Stops any previously running container and starts a new one from the freshly built image, exposing the app on port 3000.

```groovy
pipeline {
    agent any
    environment {
        IMAGE_NAME = "jenkins-demo-app"
        CONTAINER_NAME = "jenkins-demo-app-container"
    }
    stages {
        stage('Checkout') { steps { checkout scm } }
        stage('Build')     { steps { sh 'docker build -t $IMAGE_NAME .' } }
        stage('Test')      { steps { sh 'docker run --rm $IMAGE_NAME npm test' } }
        stage('Deploy') {
            steps {
                sh '''
                    docker stop $CONTAINER_NAME || true
                    docker rm $CONTAINER_NAME || true
                    docker run -d --name $CONTAINER_NAME -p 3000:3000 $IMAGE_NAME
                '''
            }
        }
    }
}
```

## Setup Instructions

### 1. Run Jenkins in Docker

```bash
docker network create jenkins

docker run -d --name jenkins \
  --network jenkins \
  -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts
```

Install the Docker CLI inside the Jenkins container so it can build/run images:

```bash
docker exec -u root jenkins bash -c "apt-get update && apt-get install -y docker.io"
```

### 2. Unlock Jenkins

```bash
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

Open `http://localhost:8080`, paste the password, install the suggested plugins, and create an admin user.

### 3. Create the Pipeline Job

1. **New Item** → name it → select **Pipeline** → OK
2. Under **Pipeline** → **Definition**: `Pipeline script from SCM`
3. **SCM**: Git
4. **Repository URL**: this repo's GitHub URL
5. **Branch**: `*/main`
6. **Script Path**: `Jenkinsfile`
7. Save

### 4. Enable Auto-Trigger on Commit

Since Jenkins runs locally, GitHub webhooks can't reach it directly, so this project uses **Poll SCM**:

- Job → **Configure** → **Build Triggers** → check **Poll SCM**
- Schedule: `H/2 * * * *` (checks for new commits every 2 minutes)

## Running It

1. Push a code change to the `main` branch.
2. Jenkins detects the change (via polling) and automatically triggers a new build.
3. Watch the pipeline progress through Checkout → Build → Test → Deploy on the Jenkins dashboard.
4. Once deployed, verify the app:

```bash
curl http://localhost:3000
```

Expected output:
```
Hello from Jenkins CI/CD Pipeline!
```

## Outcome

This project demonstrates a basic but complete CI/CD workflow: source code changes are automatically built into a Docker image, tested, and deployed — with visibility into each stage via the Jenkins dashboard.
