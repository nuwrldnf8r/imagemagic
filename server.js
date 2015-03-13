/**
imageresize - https://github.com/nuwrldnf8r/imageresize
Service to resize images from a URL source
Author: Gavin Marshall 
Contributor: Deen Hans <deen.hans@konga.com>
*/

var express = require('express');
var gm = require('gm').subClass({ graphicMagick: true });
var mime = require('mime');
var request = require('request');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.urlencoded({
	extended : true
}));
app.use(bodyParser.json());


function checkURL(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?'+
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+
  '((\\d{1,3}\\.){3}\\d{1,3}))'+
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+
  '(\\?[;&a-z\\d%_.~+=-]*)?'+
  '(\\#[-a-z\\d_]*)?$','i');
  if(!pattern.test(str)) {
    return false;
  } else {
    return true;
  }
}

var errorResponse = {'METHOD_NOT_IMPLEMENTED' : 'Method not implemented',
			'NO_IMAGE_FOUND' : 'No image found/Invalid URL',
			'BAD_REQUEST' : 'Bad request sent to server'
};

var httpCode = {'NOT_FOUND' : 404,
				'BAD_REQUEST' : 400,
				'INTERNAL_SERVER_ERROR' : 500
};

app.get('/resize',function(req,res){
	if(checkURL(req.query.url)){
		var w = (req.query.w)?req.query.w:100;  //width
		var h= (req.query.h)?req.query.h:w;  //height
		var q = (req.query.q)?req.query.q:50;  //quality
		gm(request(req.query.url))
			.resize(w, h)
			.quality(q)
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
	    						res.status(httpCode.NOT_FOUND)
								.json({status : 'error', message : errorResponse.NO_IMAGE_FOUND})
	    					}
	    					
	    					buf = null;
	    				});	
	    			});
	    		}
	    		else{
	    			res.status(httpCode.BAD_REQUEST)
					.json({status : 'error', message : errorResponse.BAD_REQUEST})
	    		}
			});
	}
	else{
		res.status(httpCode.NOT_FOUND)
		.json({status : 'error', message : errorResponse.NO_IMAGE_FOUND})
	}
});

app.get('*', function(req, res){
	res.status(httpCode.NOT_FOUND)
	.json({status : 'error', message : errorResponse.METHOD_NOT_IMPLEMENTED});
});

app.listen(8080);
