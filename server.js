var express = require('express');
var gm = require('gm');
var mime = require('mime');
var request = require('request');

var app = express();
app.use(express.bodyParser());

app.get('/ping',function(req,res){
	res.send('hello');
});

app.get('/resize',function(req,res){
	
	if(req.query.url){
		var w = (req.query.w)?req.query.w:100;
		var h= (req.query.h)?req.query.h:100;
		
		gm(request(req.query.url))
			.resize(w, h)
			.stream(function(err, stdout, stderr) {
				if(stdout){
					var buf = new Buffer('');
	    			stdout.on('data', function(data) {
	    				buf = Buffer.concat([buf, data]);
	    			});
	    			stdout.on('end', function(data) {
	    				gm(buf).identify(function(err,info){
	    					if(!err){
	    						res.contentType(mime.lookup(info.format));
	    						res.end(buf, 'binary');
	    					}
	    					else{
	    						res.writeHead( 404, 'no image found at ' + req.query.url, {'content-type' : 'text/plain'});
    							res.end('no image found at ' + req.query.url);
	    					}
	    					
	    					buf = null;
	    				});	
	    			});
	    		}
	    		else{
	    			res.writeHead( 400, 'bad format - no idea what you did here', {'content-type' : 'text/plain'});
    				res.end( 'bad format - no idea what you did here');
	    		}
			});
	}
	else{
		res.writeHead( 400, 'bad format: no url', {'content-type' : 'text/plain'});
    	res.end( 'No url');
	}
});

app.listen(8080);




