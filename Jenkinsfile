pipeline {
  agent any

  environment {
    SAST_API_URL = 'http://host.docker.internal:8000'
    // Optional: set to pick by name instead of git URL match
    // SAST_PROJECT_NAME = 'My Todo App'
  }

  stages {
    stage('SAST scan gate') {
      steps {
        script {
          def normalizeGitUrl = { String url ->
            if (!url) return ''
            def u = url.trim().toLowerCase()
            u = u.replaceAll(/\.git$/, '')
            u = u.replaceFirst(/^git@github\.com:/, 'https://github.com/')
            u = u.replaceFirst(/^ssh:\/\/git@github\.com\//, 'https://github.com/')
            return u
          }

          def commitSha = sh(script: 'git rev-parse HEAD', returnStdout: true).trim()
          def branch = env.BRANCH_NAME ?: env.GIT_BRANCH?.replaceFirst(/^origin\//, '') ?: 'master'
          def remoteUrl = sh(script: 'git config --get remote.origin.url', returnStdout: true).trim()

          withCredentials([string(credentialsId: 'sast-api-token', variable: 'SAST_API_TOKEN')]) {

            // Resolve project from GET /projects (match git remote → default_git_url)
            def projectsResponse = httpRequest(
              httpMode: 'GET',
              url: "${env.SAST_API_URL}/projects",
              customHeaders: [
                [name: 'Authorization', value: "Bearer ${env.SAST_API_TOKEN}", maskValue: true]
              ],
              validResponseCodes: '200'
            )
            def projects = readJSON text: projectsResponse.content
            if (!projects || projects.size() == 0) {
              error('No projects found. Create one in Secure Build UI or via POST /projects.')
            }

            def project = null
            if (env.SAST_PROJECT_NAME?.trim()) {
              project = projects.find { p -> (p.name ?: '').equalsIgnoreCase(env.SAST_PROJECT_NAME.trim()) }
              if (!project) {
                error("No project named '${env.SAST_PROJECT_NAME}'. Available: ${projects.collect { it.name }.join(', ')}")
              }
            } else {
              def normalizedRemote = normalizeGitUrl(remoteUrl)
              def matches = projects.findAll { p -> normalizeGitUrl(p.default_git_url) == normalizedRemote }
              if (matches.size() == 1) {
                project = matches[0]
              } else if (matches.size() > 1) {
                error("Multiple projects match ${remoteUrl}. Set SAST_PROJECT_NAME to disambiguate.")
              } else {
                projects.each { p -> echo "  - ${p.name} | id=${p.id} | git=${p.default_git_url}" }
                error("No project matches git remote ${remoteUrl}")
              }
            }

            def projectId = project.id
            echo "Using project: ${project.name} (${projectId}) for ${remoteUrl}"

            def triggerResponse = httpRequest(
              httpMode: 'POST',
              url: "${env.SAST_API_URL}/scans",
              customHeaders: [
                [name: 'Authorization', value: "Bearer ${env.SAST_API_TOKEN}", maskValue: true],
                [name: 'Content-Type', value: 'application/json']
              ],
              requestBody: """{
                "project_id": "${projectId}",
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
            if (!scanId) {
              error("Failed to trigger scan: ${triggerResponse.content}")
            }
            echo "Scan triggered: ${scanId} (status: ${triggerJson.status}, reused: ${triggerJson.reused})"

            def finalStatus = null
            def finalMessage = ''
            timeout(time: 30, unit: 'MINUTES') {
              waitUntil {
                def statusResponse = httpRequest(
                  httpMode: 'GET',
                  url: "${env.SAST_API_URL}/scans/${scanId}/status",
                  customHeaders: [
                    [name: 'Authorization', value: "Bearer ${env.SAST_API_TOKEN}", maskValue: true]
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

            if (!(finalStatus in ['success', 'failed'])) {
              error("Scan timed out after 30 minutes (last status: ${finalStatus})")
            }
            if (finalStatus == 'failed') {
              error("Scan engine failed: ${finalMessage ?: 'unknown error'}")
            }

            def resultsResponse = httpRequest(
              httpMode: 'GET',
              url: "${env.SAST_API_URL}/scans/${scanId}/results",
              customHeaders: [
                [name: 'Authorization', value: "Bearer ${env.SAST_API_TOKEN}", maskValue: true]
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

            echo 'Security gate passed.'
          }
        }
      }
    }
  }
}
