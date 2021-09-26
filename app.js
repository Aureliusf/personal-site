var server = require('hexo-server')
var http = require('http')

http.createServer(onRequest).listen(80);
console.log('Server has started');

function onRequest(request, response){
  response.writeHead(200);
  response.write('Hello Noders');
  response.end();
}
