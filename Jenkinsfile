pipeline {
  agent any

  environment {
    SAST_API_URL    = 'http://host.docker.internal:8000'
    SAST_PROJECT_ID = '62d3c786-0c00-44cb-8c8b-f058e9733676'
  }

  stages {
    stage('SAST scan gate') {
      steps {
        script {
          def commitSha = sh(script: 'git rev-parse HEAD', returnStdout: true).trim()
          def branch = env.BRANCH_NAME ?: env.GIT_BRANCH?.replaceFirst(/^origin\//, '') ?: 'master'

          withCredentials([string(credentialsId: 'sast-api-token', variable: 'SAST_API_TOKEN')]) {

            def triggerResponse = httpRequest(
              httpMode: 'POST',
              url: "${env.SAST_API_URL}/scans",
              customHeaders: [
                [name: 'Authorization', value: "Bearer ${env.SAST_API_TOKEN}"],
                [name: 'Content-Type', value: 'application/json']
              ],
              requestBody: """{
                "project_id": "${env.SAST_PROJECT_ID}",
                "commit_sha": "${commitSha}",
                "branch": "${branch}",
                "force": true,
                "metadata": {
                  "source": "jenkins",
                  "jenkins_build": "${env.BUILD_URL}"
                }
              }""",
              validResponseCodes: '202'
            )

            def triggerJson = readJSON text: triggerResponse.content
            def scanId = triggerJson.scan_id
            echo "Scan triggered: ${scanId} (status: ${triggerJson.status}, reused: ${triggerJson.reused})"

            def finalStatus = null
            def finalMessage = ''
            timeout(time: 30, unit: 'MINUTES') {
              waitUntil {
                def statusResponse = httpRequest(
                  httpMode: 'GET',
                  url: "${env.SAST_API_URL}/scans/${scanId}/status",
                  customHeaders: [
                    [name: 'Authorization', value: "Bearer ${env.SAST_API_TOKEN}"]
                  ],
                  validResponseCodes: '200'
                )
                def statusJson = readJSON text: statusResponse.content
                finalStatus = statusJson.status
                finalMessage = statusJson.message ?: ''
                echo "Scan ${scanId}: ${finalStatus} (${statusJson.progress}%) ${finalMessage}"
                if (finalStatus in ['success', 'failed']) {
                  return true
                }
                sleep time: 20, unit: 'SECONDS'
                return false
              }
            }

            if (finalStatus == 'failed') {
              error("Scan engine failed: ${finalMessage ?: 'unknown error'}")
            }

            def resultsResponse = httpRequest(
              httpMode: 'GET',
              url: "${env.SAST_API_URL}/scans/${scanId}/results",
              customHeaders: [
                [name: 'Authorization', value: "Bearer ${env.SAST_API_TOKEN}"]
              ],
              validResponseCodes: '200'
            )
            def results = readJSON text: resultsResponse.content
            def gate = results.gate_summary

            echo "Vulnerabilities found: ${gate.vulnerabilities_found}"
            echo "By severity: ${gate.by_severity}"

            if (gate.gate_failed) {
              error("Security gate failed: ${gate.gate_reason ?: 'threshold exceeded'}")
            }
          }
        }
      }
    }
  }
}
