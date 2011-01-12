/*
 * 
 * iTunes interface for Node.js
 * Author: Garrett Wilkin 
 * Date  : 2011/1/7 
 * 
 * 
 */

var http = require('http');
var querystring = require('querystring');
var Divider = require('./divider').Divider;
var Timer = require('./timer.js').Timer;
var iResults= require('./iresults.js').iResults;


/*
 * 
 * Seperate object for parameters to facilitate use with query string. 
 * Specific to iTunes. This is the full set of searchable fields.
 * 
 */

function iParameters() {

    this.term = '';
    this.country = 'us';
    this.media = 'all';
    this.entity = 'musicTrack';
    this.attribute = 'all';
//    this.callback = 'wsSearchCB';
    this.limit = '40';
    this.lang = 'en_us';
    this.version = '2';
    this.explicit = 'Yes';

};

/*
 * 
 * Object to hold iTunes specific attributes.
 * 
 */

function iTunes() {
    this.params = new iParameters();
    this.basePath = '/WebObjects/MZStoreServices.woa/wa/wsSearch?';
    this.server= 'ax.itunes.apple.com';
};

iTunes.prototype.getQuery = function() {
    console.log(this.params);
    var query = querystring.stringify(this.params);
    console.log('QUERY : ' + query);
    return query;
};

/*
 * 
 * Generic Search class for retrieving music data.
 * 
 */

function Search() {
    this.AppleMedia = new iTunes();
    this.iresults = new iResults();
};
exports.Search= Search;

Search.prototype.getArtist = function(artist) {
   this.AppleMedia.params.term = artist.replace(/ /g,'+'); 
   this.AppleMedia.params.entity = 'musicArtist'; 
   this.AppleMedia.params.attribute= 'artistTerm'; 
   this.AppleMedia.params.media = 'music'; 
   this.request('itunes',this.AppleMedia.params.term)
};


Search.prototype.request = function(source, label) {
    var self = this;
    var ok = 1;
    var clock = new Timer(label);
    
    if (source== 'itunes') {
        console.log('Initiating iTunes request.');
        var apple = http.createClient(80,self.AppleMedia.server);
        var query = self.AppleMedia.getQuery();
        var path = self.AppleMedia.basePath + query;
        console.log('SERVER: ' + self.AppleMedia.server);
        console.log('PATH: ' + path);
        var request = apple.request('GET',path,{host:self.AppleMedia.server});
        apple.request('GET',path);
        request.end();
        clock.set();
        request.on('response', function(response) {
//            console.log('STATUS: ' + response.statusCode);
//            console.log('HEADERS ' + JSON.stringify(response.headers));
            response.setEncoding('utf8');
            response.on('data', function(chunk) {
                clock.elapsed();
                self.iresults.capture(chunk);
            });
            response.on('end', function() {
                clock.elapsed();
                self.iresults.parse();
            });
        });
    } else {
        pretty.print('source (' + source + ') not yet implemented');
    }
    return ok;
};
