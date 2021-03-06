const { events, Job } = require("brigadier");


events.on("push", (brigadeEvent, project) => {
    var gitPayload = JSON.parse(brigadeEvent.payload)
    var today = new Date()
    var gitSHA = brigadeEvent.revision.commit.substr(0,7)
    var imageTag = String(gitSHA)
    // Create a new job
  var dockerBuild = new Job("docker-build")

  dockerBuild.image = "docker:dind"
  dockerBuild.privileged = true;

  dockerBuild.env = {
    DOCKER_DRIVER: "overlay"
  }

  dockerBuild.env.DOCKER_USER = project.secrets.dockerLogin
  dockerBuild.env.DOCKER_PASS = project.secrets.dockerPass
  dockerBuild.env.GCR_REPONAME = project.secrets.mygcr
  dockerBuild.env.GCR_IMAGE = project.secrets.gcrimage

  dockerBuild.tasks = [
    "dockerd-entrypoint.sh &", // Start the docker daemon
    "sleep 20", // Grant it enough time to be up and running
    "cd /src/", // Go to the project checkout dir
    "docker build -t $GCR_REPONAME/$GCR_IMAGE:"+imageTag+" .", // Replace with your own image tag
    "docker login $GCR_REPONAME -u $DOCKER_USER -p $DOCKER_PASS",
    "docker push $GCR_REPONAME/$GCR_IMAGE:"+imageTag+"" // Replace with your own image tag
  ]

  dockerBuild.run()

  var nodedeploy = new Job("node-deploy")

  nodedeploy.image = "microsoft/azure-cli:latest"
 

  nodedeploy.env.SERVICE_USER = project.secrets.serviceuser
  nodedeploy.env.SERVICE_PASS = project.secrets.servicepass
  nodedeploy.env.SERVICETENANT = project.secrets.servicetenant
  nodedeploy.env.GCR_REPONAME = project.secrets.mygcr
  nodedeploy.env.GCR_IMAGE = project.secrets.gcrimage

  nodedeploy.tasks = [
  "curl -L https://dl.k8s.io/v1.10.6/bin/linux/amd64/kubectl -o /usr/local/bin/kubectl",
  "sleep 100",
  "cd /usr/local/bin",
  "chmod -R 775 kubectl",
  "az login --service-principal -u $SERVICE_USER -p $SERVICE_PASS --tenant $SERVICETENANT",
  "az aks get-credentials --resource-group Myk8s --name Myk8s",
  "kubectl set image deployment/nginx nginx=$GCR_REPONAME/$GCR_IMAGE:"+imageTag+""
  ]

  nodedeploy.run()



})
