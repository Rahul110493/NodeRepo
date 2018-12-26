var express = require('express')
var app = express()

app.set('port',5000)
app.use(express.static(__dirname + '/public'))

app.get('/', function(request, response) {
  response.send('Hello World there is one more more change')
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
