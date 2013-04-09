VideoRecorder = function VideoRecorder(aConfig){
	this.video = aConfig.video;
	this.canvas  = aConfig["canvas"] || document.createElement('canvas');
	this.context = this.canvas.getContext('2d');
	
	this.width = this.video.width = this.canvas.width = aConfig["width"] || 320;
	this.height =  this.video.height = this.canvas.height = aConfig["height"] || 240;
	
	this.frames = [];
	this.quality = aConfig["quality"] || 1.0;
};

VideoRecorder.prototype.start = function(){
	var self = this;
	this.timer = setInterval(function(){
		self.context.drawImage(self.video, 0, 0, self.width, self.height);
		self.frames.push(self.canvas.toDataURL('image/webp', self.quality));
	}, 65);
};

VideoRecorder.prototype.stop = function(){
	clearInterval(this.timer);
};

VideoRecorder.prototype.clear = function(){
	this.frames = [];
};

VideoRecorder.prototype.getStream = function (aCallback){
	var lStreamImages = this.frames;
	this.frames = [];
		
	var reader = new FileReader();
	reader.onload = function(event){
		aCallback(event.target.result); 
	};
	reader.readAsDataURL(Whammy.fromImageArray(lStreamImages, 16));
};

AudioRecorder = function AudioRecorder(aConfig){
	this.stream = aConfig.stream;
};

AudioRecorder.prototype.start = function(){
	initAudioRecorder(this.audioWorkerPath);
	
	var audioContext = new AudioContext;
	var mediaStreamSource = audioContext.createMediaStreamSource(this.stream);

	mediaStreamSource.connect(this.audioContext.destination);
	this.recorder = new Recorder(mediaStreamSource);
	this.recorder.record();
};

AudioRecorder.prototype.stop = function(){
	this.recorder.stop();
	this.recorder.clear();
};

AudioRecorder.prototype.clear = function(){
	this.recorder.clear();
};

AudioRecorder.prototype.getStream = function (aCallback){
	this.recorder.exportWAV(aCallback);
};


//WebRTCVideoRecorder = function WebRTCVideoRecorder(aConfig){
//	this.stream = aConfig.stream;
//}
//
//WebRTCVideoRecorder.prototype.start = function(){
//	this.streamRecorder = this.stream.record();
//}
//
//WebRTCVideoRecorder.prototype.stop = function(){
//	this.streamRecorder.getRecordedData(function(){});
//}
//
//WebRTCVideoRecorder.prototype.getStream = function(aCallback){
//	this.streamRecorder.getRecordedData(function(aBlob){
//		var reader = new FileReader();
//		reader.onload = function(event){
//			aCallback(event.target.result); 
//		};
//		reader.readAsDataURL(aBlob);
//	});
//}

function RecordRTC(config) {
	var win = window,
	requestAnimationFrame = win.webkitRequestAnimationFrame,
	cancelAnimationFrame = win.webkitCancelAnimationFrame,
	URL = win.webkitURL,
	canvas = document.createElement('canvas'),
	context = canvas.getContext('2d'),
	video = config.video;
	var timer;

	if (video) {
		video.width = canvas.width = 320;
		video.height = canvas.height =240;
	}

	var requestedAnimationFrame, frames = [];

	function recordVideo() {
		if (!video) {
			alert('No video element found.');
			return;
		}
		console.log('started recording video frames');
		var height = canvas.height,
		width = canvas.width;

		frames = [];

		//				function drawVideoFrame() {
		//					requestedAnimationFrame = requestAnimationFrame(drawVideoFrame);
		//					context.drawImage(video, 0, 0, width, height);
		//					frames.push(canvas.toDataURL('image/webp', 1.0));
		//				};
		//		
		//				requestedAnimationFrame = requestAnimationFrame(drawVideoFrame);
		timer = setInterval(function(){
			context.drawImage(video, 0, 0, width, height);
			frames.push(canvas.toDataURL('image/webp', 0.5));
		}, 65);
		

	}

	var blobURL, blobURL2, fileType;

	function stopVideoRecording() {
		console.warn('stopped recording video frames');
		cancelAnimationFrame(requestedAnimationFrame);

		blobURL = Whammy.fromImageArray(frames, 1000 / 60);
		fileType = 'webm';
		setBlob(blobURL);
		frames = [];
	}
	
	function getLiveBase64(aFn){
		var lRecordedFrames = frames;
		frames = [];
		
		var reader = new FileReader();
		reader.onload = function(event){
			aFn(event.target.result); 
		};
		reader.readAsDataURL(Whammy.fromImageArray(lRecordedFrames, 15));
	}

	function saveToDisk() {
		var url = writer.toURL();
		if (url) return window.open(url);
		else {
			console.log('saving recorded stream to disk!');
			var save = document.createElement('a');
			save.href = blobURL2;
			save.target = '_blank';
			save.download = (Math.random() * 1000 << 1000) + '.' + fileType;

			var event = document.createEvent('Event');
			event.initEvent('click', true, true);

			save.dispatchEvent(event);
			URL.revokeObjectURL(save.href);
		}
	}

	var AudioContext = win.webkitAudioContext,
	recorder, audioContext;

	function recordAudio() {
		if (!config.stream) {
			alert('No audio stream found.');
			return;
		}
		initAudioRecorder(config.audioWorkerPath);
		audioContext = new AudioContext;
		var mediaStreamSource = audioContext.createMediaStreamSource(config.stream);

		mediaStreamSource.connect(audioContext.destination);
		recorder = new window.Recorder(mediaStreamSource);

		recorder && recorder.record();
	}

	function stopAudioRecording() {
		console.warn('stopped recording audio frames');
		recorder && recorder.stop();
		recorder && recorder.exportWAV(function (blob) {
			fileType = 'wav';
			setBlob(blob);
		});
		recorder && recorder.clear();
	}
	var writer;

	function setBlob(blob) {
		blobURL = blob;

		var config = {
			blob: blobURL,
			type: fileType === 'webm' ? 'video/webm' : 'audio/wav',
			fileName: (Math.random() * 1000 << 1000) + '.' + fileType,
			size: blobURL.length
		};
		writer = RecordRTCFileWriter(config);

		var reader = new win.FileReader();
		reader.readAsDataURL(blobURL);
		reader.onload = function (event) {
			blobURL2 = event.target.result;
		};
	}

	return {
		stopAudio: stopAudioRecording,
		stopVideo: stopVideoRecording,
		recordVideo: recordVideo,
		recordAudio: recordAudio,
		save: saveToDisk,
		getLiveBase64: getLiveBase64,
		getBlob: function () {
			return blobURL2;
		},
		toURL: function () {
			return writer.toURL();
		}
	};
}

function RecordRTCFileWriter(config) {
	window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
	var file;

	var size = config.size,
	fileName = config.fileName,
	blob = config.blob,
	type = config.type;

	window.requestFileSystem(window.TEMPORARY, size, onsuccess, onerror);

	function onsuccess(fileSystem) {
		fileSystem.root.getFile(fileName, {
			create: true,
			exclusive: false
		}, onsuccess, onerror);

		function onsuccess(fileEntry) {
			fileEntry.createWriter(onsuccess, onerror);

			function onsuccess(fileWriter) {
				fileWriter.onwriteend = function (e) {
					console.log(fileEntry.toURL());
					file = fileEntry;
				};

				fileWriter.onerror = function (e) {
					error('fileWriter error', e);
				};

				blob = new Blob([blob], {
					type: type
				});

				fileWriter.write(blob);
			}

			function onerror(e) {
				error('fileEntry error', e);
			}
		}

		function onerror(e) {
			error('fileSystem error', e);
		}
	}

	function onerror(e) {
		error('requestFileSystem error', e);
	}

	var errorMessage;

	function error(level, e) {
		var msg = '';

		switch (e.code) {
			case FileError.QUOTA_EXCEEDED_ERR:
				msg = 'QUOTA_EXCEEDED_ERR';
				break;
			case FileError.NOT_FOUND_ERR:
				msg = 'NOT_FOUND_ERR';
				break;
			case FileError.SECURITY_ERR:
				msg = 'SECURITY_ERR';
				break;
			case FileError.INVALID_MODIFICATION_ERR:
				msg = 'INVALID_MODIFICATION_ERR';
				break;
			case FileError.INVALID_STATE_ERR:
				msg = 'INVALID_STATE_ERR';
				break;
			default:
				msg = 'Unknown Error';
				break;
		};

		errorMessage = msg;
		if (errorMessage === 'SECURITY_ERR')
			errorMessage = 'SECURITY_ERR: Are you using chrome incognito mode? It seems that access to "requestFileSystem" API is denied.';

		console.error(level + ':\n' + errorMessage);
	}
	return {
		toURL: function () {
			if (errorMessage) alert(errorMessage);
			else return file.toURL();
		}
	};
}

/* https://github.com/mattdiamond/Recorderjs */
function initAudioRecorder(audioWorkerPath) {

	var WORKER_PATH = audioWorkerPath || 'audio-recorder.js';

	var Recorder = function (source, cfg) {
		var config = cfg || {};
		var bufferLen = config.bufferLen || 4096;
		this.context = source.context;
		this.node = this.context.createJavaScriptNode(bufferLen, 2, 2);
		var worker = new Worker(config.workerPath || WORKER_PATH);
		worker.postMessage({
			command: 'init',
			config: {
				sampleRate: this.context.sampleRate
			}
		});
		var recording = false,
		currCallback;

		this.node.onaudioprocess = function (e) {
			if (!recording) return;
			worker.postMessage({
				command: 'record',
				buffer: [
				e.inputBuffer.getChannelData(0),
				e.inputBuffer.getChannelData(1)]
			});
		};

		this.configure = function (_cfg) {
			for (var prop in _cfg) {
				if (_cfg.hasOwnProperty(prop)) {
					config[prop] = _cfg[prop];
				}
			}
		};

		this.record = function () {
			recording = true;
		};

		this.stop = function () {
			recording = false;
		};

		this.clear = function () {
			worker.postMessage({
				command: 'clear'
			});
		};

		this.getBuffer = function (cb) {
			currCallback = cb || config.callback;
			worker.postMessage({
				command: 'getBuffer'
			});
		};
		this.exportWAV = function (cb, type) {
			currCallback = cb || config.callback;
			type = type || config.type || 'audio/wav';
			if (!currCallback) throw new Error('Callback not set');
			worker.postMessage({
				command: 'exportWAV',
				type: type
			});
		};

		worker.onmessage = function (e) {
			var blob = e.data;
			currCallback(blob);
		};

		source.connect(this.node);
		this.node.connect(this.context.destination);
	};

	Recorder.forceDownload = function (blob, filename) {
		var url = (window.URL || window.webkitURL).createObjectURL(blob);
		var link = window.document.createElement('a');
		link.href = url;
		link.download = filename || 'output.wav';
		var click = document.createEvent("Event");
		click.initEvent("click", true, true);
		link.dispatchEvent(click);
	};

	window.Recorder = Recorder;

};


/* https://github.com/antimatter15/whammy */
var Whammy=function(){
	function g(a){
		for(var b=a[0].width,e=a[0].height,c=a[0].duration,d=1;d<a.length;d++){
			if(a[d].width!=b)throw"Frame "+(d+1)+" has a different width";
			if(a[d].height!=e)throw"Frame "+(d+1)+" has a different height";
			if(0>a[d].duration)throw"Frame "+(d+1)+" has a weird duration";
			c+=a[d].duration
		}
		var f=0,a=[{
			id:440786851,
			data:[{
				data:1,
				id:17030
			},{
				data:1,
				id:17143
			},{
				data:4,
				id:17138
			},{
				data:8,
				id:17139
			},{
				data:"webm",
				id:17026
			},{
				data:2,
				id:17031
			},{
				data:2,
				id:17029
			}]
		},{
			id:408125543,
			data:[{
				id:357149030,
				data:[{
					data:1E6,
					id:2807729
				},{
					data:"whammy",
					id:19840
				},{
					data:"whammy",
					id:22337
				},{
					data:[].slice.call(new Uint8Array((new Float64Array([c])).buffer),0).map(function(a){
						return String.fromCharCode(a)
					}).reverse().join(""),
					id:17545
				}]
			},{
				id:374648427,
				data:[{
					id:174,
					data:[{
						data:1,
						id:215
					},{
						data:1,
						id:25541
					},{
						data:0,
						id:156
					},{
						data:"und",
						id:2274716
					},{
						data:"V_VP8",
						id:134
					},{
						data:"VP8",
						id:2459272
					},{
						data:1,
						id:131
					},{
						id:224,
						data:[{
							data:b,
							id:176
						},{
							data:e,
							id:186
						}]
					}]
				}]
			},{
				id:524531317,
				data:[{
					data:0,
					id:231
				}].concat(a.map(function(a){
					var b;
					b=a.data.slice(4);
					var c=Math.round(f);
					b=[129,c>>8,c&255,128].map(function(a){
						return String.fromCharCode(a)
					}).join("")+b;
					f+=a.duration;
					return{
						data:b,
						id:163
					}
				}))
			}]
		}];
		return j(a)
	}
	function m(a){
		for(var b=[];0<a;)b.push(a&255),a>>=8;
		return new Uint8Array(b.reverse())
	}
	function k(a){
		for(var b=[],a=(a.length%8?Array(9-a.length%8).join("0"):"")+a,e=0;e<a.length;e+=8)b.push(parseInt(a.substr(e,8),2));
		return new Uint8Array(b)
	}
	function j(a){
		for(var b=[],e=0;e<a.length;e++){
			var c=a[e].data;
			"object"==typeof c&&
			(c=j(c));
			"number"==typeof c&&(c=k(c.toString(2)));
			if("string"==typeof c){
				for(var d=new Uint8Array(c.length),f=0;f<c.length;f++)d[f]=c.charCodeAt(f);
				c=d
			}
			f=c.size||c.byteLength;
			d=Math.ceil(Math.ceil(Math.log(f)/Math.log(2))/8);
			f=f.toString(2);
			f=Array(7*d+8-f.length).join("0")+f;
			d=Array(d).join("0")+"1"+f;
			b.push(m(a[e].id));
			b.push(k(d));
			b.push(c)
		}
		return new Blob(b,{
			type:"video/webm"
		})
	}
	function l(a){
		for(var b=a.RIFF[0].WEBP[0],e=b.indexOf("\u009d\u0001*"),c=0,d=[];4>c;c++)d[c]=b.charCodeAt(e+3+c);
		c=d[1]<<
		8|d[0];
		e=c&16383;
		c=d[3]<<8|d[2];
		return{
			width:e,
			height:c&16383,
			data:b,
			riff:a
		}
	}
	function h(a){
		for(var b=0,e={};
			b<a.length;){
			var c=a.substr(b,4),d=parseInt(a.substr(b+4,4).split("").map(function(a){
				a=a.charCodeAt(0).toString(2);
				return Array(8-a.length+1).join("0")+a
			}).join(""),2),f=a.substr(b+4+4,d),b=b+(8+d);
			e[c]=e[c]||[];
			"RIFF"==c||"LIST"==c?e[c].push(h(f)):e[c].push(f)
		}
		return e
	}
	function i(a,b){
		this.frames=[];
		this.duration=1E3/a;
		this.quality=b||0.8
	}
	i.prototype.add=function(a,b){
		if("undefined"!=typeof b&&
			this.duration)throw"you can't pass a duration if the fps is set";
		if("undefined"==typeof b&&!this.duration)throw"if you don't have the fps set, you ned to have durations here.";
		a.canvas&&(a=a.canvas);
		if(a.toDataURL)a=a.toDataURL("image/webp",this.quality);
		else if("string"!=typeof a)throw"frame must be a a HTMLCanvasElement, a CanvasRenderingContext2D or a DataURI formatted string";
		if(!/^data:image\/webp;base64,/ig.test(a))throw"Input must be formatted properly as a base64 encoded DataURI of type image/webp";
		this.frames.push({
			image:a,
			duration:b||this.duration
		})
	};
	
	i.prototype.compile=function(){
		return new g(this.frames.map(function(a){
			var b=l(h(atob(a.image.slice(23))));
			b.duration=a.duration;
			return b
		}))
	};
	
	return{
		Video:i,
		fromImageArray:function(a,b){
			return g(a.map(function(a){
				a=l(h(atob(a.slice(23))));
				a.duration=1E3/b;
				return a
			}))
		},
		toWebM:g
	}
}();