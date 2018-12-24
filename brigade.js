const { events, Job } = require("brigadier");


events.on("push", function(e, project) {
 console.log("received push for commit " + e.revision.commit)

  // Create a new job

  var nodedeploy = new Job("node-deploy")

  nodedeploy.image = "node"

  nodedeploy.tasks = [
    "cd /src/",
    "npm install"
    "sleep 20"
    "npm start"
  ]

  nodedeploy.run()


})
