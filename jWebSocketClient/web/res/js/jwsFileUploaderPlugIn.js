//	---------------------------------------------------------------------------
//	jWebSocket jwsFileUploader plug-in (Community Edition, CE)
//	---------------------------------------------------------------------------
//	Copyright 2010-2013 Innotrade GmbH (jWebSocket.org)
//  Alexander Schulze, Germany (NRW)
//
//	Licensed under the Apache License, Version 2.0 (the "License");
//	you may not use this file except in compliance with the License.
//	You may obtain a copy of the License at
//
//	http://www.apache.org/licenses/LICENSE-2.0
//
//	Unless required by applicable law or agreed to in writing, software
//	distributed under the License is distributed on an "AS IS" BASIS,
//	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//	See the License for the specific language governing permissions and
//	limitations under the License.
//	---------------------------------------------------------------------------

/*
 * @authors Rolando Santamaria, Victor Antonio Barzana
 */

//:package:*:jws
//:class:*:jws.jwsFileUploaderPlugIn
//:ancestor:*:-
//:d:en:Implementation of the [tt]jws.jwsFileUploaderPlugIn[/tt] class.
//:d:en:This client-side plug-in provides the API to upload files from any web _
//:d:en:based client to the jWebSocket Server. _
jws.FileUploaderPlugIn = {
	STATUS_READY: 0,
	STATUS_UPLOADING: 1,
	STATUS_UPLOADED: 2,
	STATUS_ERROR: 3,
	STATUS_PAUSED: 4,
	STATUS_CANCELED: 5,
	TT_FILE_SELECTED: "OnFileSelected",
	TT_FILE_UPLOADED: "OnFileSaved",
	TT_FILE_DELETED: "OnFileDeleted",
	TT_UPLOAD_STARTED: "OnUploadStarted",
	TT_UPLOAD_STOPPED: "OnUploadStopped",
	TT_UPLOAD_PROGRESS: "OnUploadProgress",
	TT_UPLOAD_COMPLETE: "OnUploadComplete",
	TT_UPLOAD_CANCELED: "OnUploadCanceled",
	TT_UPLOAD_ERROR: "OnUploadError",
	TT_ERROR: "OnError",
	queue: [],
	chunkSize: 500000,
	defaultScope: jws.SCOPE_PUBLIC,
	listeners: {},
	browseButton: {},
	userBrowseButton: {},
	isFlashFileReader: function() {
		return window.FileReader && window.FileReader.isFlashFallback ? true : false;
	},
	initUploaderPlugIn: function(aConfig) {
		aConfig = aConfig || {};
		this.listeners = {};
		this.queue = [];
		// The upload button is required, we will render a transparent button 
		// over the upload button
		if (aConfig.browseButtonId) {
			var lUserBrowseBtn = document.getElementById(aConfig.browseButtonId),
					lBrowseButton = document.createElement('input');
			lBrowseButton.setAttribute('type', 'file');
			lBrowseButton.setAttribute('multiple', 'true');
			lBrowseButton.style.cssText = 'visibility:hidden !important;display: none !important;';
			var lMe = this;
			lUserBrowseBtn.appendChild(lBrowseButton);
			lUserBrowseBtn.onclick = function() {
				lMe.browse();
			};
			this.browseButton = lBrowseButton;

			var lFlashFileReader = new FlashFileReader({
				inputs: [aConfig.browseButtonId],
				filereader: 'js/FileReader/src/filereader.swf',
				expressInstall: "js/FileReader/swfobject/expressInstall.swf",
				debugMode: false,
				multiple: true,
				callback: function() {
					console.log("Flash HTML5 File API fallback is ready");
				}
			});

			this.chunkSize = aConfig.chunkSize || this.chunkSize;
			this.defaultScope = aConfig.defaultScope || this.defaultScope;

			// TODO: remove jQuery dependency
			$(lUserBrowseBtn).on('change', function(aEvt) {
				lMe.onFileSelected(aEvt);
			});
			lMe.setFileSystemCallbacks({
				OnFileSaved: function(aToken) {
					console.log("File " + aToken.filename + " has been uploaded successfully to the server.");
					var lUploadedItem = this.getFile(aToken.filename);
					if (lUploadedItem) {
						lUploadedItem.setProgress(100);
						lUploadedItem.setUploadedBytes(lUploadedItem.getFile().size);
						lUploadedItem.setStatus(this.STATUS_UPLOADED);
					}
					lMe.fireUploaderEvent(lMe.TT_FILE_UPLOADED, lUploadedItem);
					var lSuccessCount = 0;
					for (var lIdx = 0; lIdx < lMe.queue.length; lIdx++) {
						if (lMe.queue[lIdx].getStatus() === lMe.STATUS_UPLOADED) {
							lSuccessCount++;
						}
					}
					if (lSuccessCount === lMe.queue.length) {
						lMe.fireUploaderEvent(lMe.TT_UPLOAD_COMPLETE);
					}
				},
				OnFileDeleted: function(aToken) {
					console.log(aToken);
					lMe.fireUploaderEvent(lMe.TT_FILE_DELETED, {
						item: lMe.getFile(aToken.filename),
						token: aToken
					});
				}
			});
		}
	},
	browse: function() {
		// Invoke the browse method without clicking the browse field
		if (!this.isFlashFileReader()) {
			this.browseButton.click();
		}
	},
	onFileSelected: function(aEvt) {
		this.fireUploaderEvent(this.TT_FILE_SELECTED, aEvt.target.files);

		var lQueueContains = function(aQueue, aFile) {
			for (var lIdx1 = 0; lIdx1 < aQueue.length; lIdx1++) {
				if (aQueue[lIdx1].getName() === aFile.name) {
					return lIdx1;
				}
			}
			return -1;
		};
		for (var lIdx = 0; lIdx < aEvt.target.files.length; lIdx++) {
			if (-1 === lQueueContains(this.queue, aEvt.target.files[lIdx])) {
				var lUploadItem = new jws.UploadItem(aEvt.target.files[lIdx]);
				this.queue.push(lUploadItem);
			}
		}
	},
	uploadFileInChunks: function(aUploadItem, aResume) {
		if (!aUploadItem) {
			return;
		}
		aUploadItem.setChunkSize(lChunkSize);
		var lFile = aUploadItem.getFile(),
				lChunkSize = this.chunkSize,
				lMe = this,
				lReader = new FileReader(),
				lTotalBytes = lFile.size,
				lBytesSent = 0,
				lBytesRead = 0;

		if (aResume) {
			lBytesSent = aUploadItem.getUploadedBytes();
			lBytesRead = aUploadItem.getUploadedBytes();
		}

		if (aUploadItem.getStatus() === this.STATUS_READY) {
			aUploadItem.setStatus(this.STATUS_UPLOADING);
			var lSave = function(aEvt) {
				if (lMe.isConnected()) {
					// We check if the upload is not paused
					if (aUploadItem.getStatus() === lMe.STATUS_UPLOADING) {
						aUploadItem.setUploadedBytes(lBytesRead);
						var lIsLast = lBytesRead >= lTotalBytes,
								lData = aEvt.target.result,
								lChunkContent = lData.substr(lData.indexOf("base64,") + 7);
						lMe.fileSaveByChunks(lFile.name, lChunkContent, lIsLast, {
							encoding: "base64",
							encode: false,
							scope: lMe.defaultScope,
							OnSuccess: function(aEvent) {
								aUploadItem.setUploadedBytes(lBytesSent);
//								aUploadItem.setStatus(this.STATUS_UPLOADING);
								lMe.fireUploaderEvent(lMe.TT_UPLOAD_PROGRESS, {
									item: aUploadItem,
									progress: aUploadItem.getProgress()
								});
								lBytesSent += lChunkSize;

								if (!lIsLast) {
									var lBlob = lFile.slice(lBytesSent, lBytesSent + lChunkSize);
									lReader.readAsDataURL(lBlob);
								}
							},
							OnFailure: function(aEvent) {
								var lMsg = "Upload failed, sorry your upload process failed on " +
										lBytesRead / lChunkSize + " chunk!" +
										" With the message: \"" + aEvent.msg + "\"";
								aUploadItem.setStatus(this.STATUS_ERROR);
								lMe.fireUploaderEvent(lMe.TT_UPLOAD_ERROR, {
									item: aUploadItem,
									msg: lMsg,
									errorEvt: aEvent
								});
								jws.console.log("Upload process failed on " + lBytesRead / lChunkSize + " chunk!");
								jws.console.log(aEvent);
							}
						});
					}
				} else {
					var lMsg = "Upload failed, the connection with the server was lost in chunk: " +
							lBytesRead / lChunkSize +
							". Please try your upload later";
					aUploadItem.setStatus(this.STATUS_ERROR);
					lMe.fireUploaderEvent(lMe.TT_UPLOAD_ERROR, {
						item: aUploadItem,
						msg: lMsg
					});
				}
			};

			lReader.onload = function(aEvt) {
				lBytesRead += lChunkSize;
				lSave(aEvt);
			};

			var lBlob = lFile.slice(lBytesSent, lChunkSize);
			lReader.readAsDataURL(lBlob);
		}
	},
	uploadCompleteFile: function(aUploadItem) {
		var lReader = new FileReader();
		var lMe = this;
		lReader.onload = function(aEvent) {
			if (lMe.isConnected()) {
				if (aUploadItem.getStatus() === lMe.STATUS_UPLOADING) {
					jws.console.log("File completely loaded with the following info, " +
							"bytes loaded: " + aEvent.loaded + ", length: " +
							aEvent.target.result.length);
					var lResult = aEvent.target.result,
							lContent = lResult.substr(lResult.indexOf("base64,") + 7);

					lMe.fileSave(aUploadItem.getName(), lContent, {
						encoding: "base64",
						encode: false,
						scope: lMe.defaultScope,
						OnSuccess: function(aEvent) {
							// File saved correctly
						}, OnFailure: function(aEvent) {
							var lMsg = "Upload failed, sorry your upload process " +
									"failed on file: " + aUploadItem.getName() + " With the message: \"" + aEvent.msg + "\"";
							aUploadItem.setStatus(this.STATUS_ERROR);
							lMe.fireUploaderEvent(lMe.TT_UPLOAD_ERROR, {
								item: aUploadItem,
								msg: lMsg,
								errorEvt: aEvent
							});
						}});
				}
			} else {
				var lMsg = "Upload failed, the connection with the server was lost while uploading file: " +
						aUploadItem.getName() + ". Please try your upload later";
				aUploadItem.setStatus(this.STATUS_ERROR);
				lMe.fireUploaderEvent(lMe.TT_UPLOAD_ERROR, {
					item: aUploadItem,
					msg: lMsg
				});
			}
		};
		lReader.readAsDataURL(aUploadItem.getFile());
	},
	startUpload: function() {
		this.fireUploaderEvent(this.TT_UPLOAD_STARTED);
		for (var lIdx = 0; lIdx < this.queue.length; lIdx++) {
			var lItem = this.queue[lIdx];
			if (lItem.getStatus() === this.STATUS_READY) {
				// If the item will be uploaded in chunks or not
				if (lItem.getChunked()) {
					this.uploadFileInChunks(lItem);
				} else {
					this.uploadCompleteFile(lItem);
				}
			}
		}
	},
	/*
	 * Removes a file from the server filesystem
	 * @param {type} aFilename the name of the file
	 * @param {type} aScope the scope in the server where the file was uploaded
	 * @returns {void}
	 */
	removeFile: function(aFilename, aScope) {
		var lMe = this;
		lMe.cancelUpload(aFilename);
		// delete a file from the fs aFilename, aForce, aOptions
		lMe.fileDelete(aFilename, true, {
			scope: aScope || this.defaultScope,
			OnSuccess: function(aToken) {
				lMe.fireUploaderEvent(lMe.TT_FILE_DELETED, {
					item: lMe.getFile(aFilename),
					token: aToken
				});
				lMe.removeFileFromQueue(aFilename);
			},
			OnFailure: function(aToken) {
				var lMsg = "Error found while removing the file: " + aFilename + "." +
						" The server returned the following error: " + aToken.msg;

				lMe.fireUploaderEvent(lMe.TT_ERROR, {
					item: lMe.getFile(aFilename),
					msg: lMsg
				});
				lMe.removeFileFromQueue(aFilename);
			}
		});
	},
	removeFileFromQueue: function(aFilename) {
		for (var lIdx = 0; lIdx < this.queue.length; lIdx++) {
			if (this.queue[lIdx].getName() === aFilename) {
				this.queue.splice(lIdx, 1);
				return;
			}
		}
	},
	addUploaderListener: function(aType, aListener) {
		if (typeof this.listeners[aType] === "undefined") {
			this.listeners[aType] = [];
		}
		this.listeners[aType].push(aListener);
	},
	addUploaderListeners: function(aListeners) {
		for (var lIdx in aListeners) {
			this.addUploaderListener(lIdx, aListeners[lIdx]);
		}
	},
	fireUploaderEvent: function(aEvent, aData) {
		if (typeof aEvent === "string") {
			aEvent = {type: aEvent};
		}
		if (!aEvent.target) {
			aEvent.target = this;
		}

		if (!aEvent.type) {  //falsy
			throw new Error("Event object missing 'type' property.");
		}

		if (this.listeners[aEvent.type] instanceof Array) {
			var listeners = this.listeners[aEvent.type];
			for (var lIdx = 0, len = listeners.length; lIdx < len; lIdx++) {
				listeners[lIdx].call(this, aEvent, aData);
			}
		}
	},
	removeUploaderListener: function(aEvent, aListener) {
		if (this.listeners[aEvent] instanceof Array) {
			var listeners = this.listeners[aEvent];
			for (var lIdx = 0, len = listeners.length; lIdx < len; lIdx++) {
				if (listeners[lIdx] === aListener) {
					listeners.splice(lIdx, 1);
					break;
				}
			}
		}
	},
	getFile: function(aFilename) {
		for (var lIdx = 0; lIdx < this.queue.length; lIdx++) {
			if (this.queue[lIdx].getName() === aFilename) {
				return this.queue[lIdx];
			}
		}
		return null;
	},
	setChunkSize: function(aChunkSize) {
		this.chunkSize = aChunkSize || this.chunkSize;
	},
	cancelUpload: function(aFilename) {
		var lFile = this.getFile(aFilename);
		if (lFile) {
			this.getFile(aFilename).setStatus(this.STATUS_CANCELED);
			this.fireUploaderEvent(this.TT_UPLOAD_CANCELED, lFile);
		}
	},
	pauseUpload: function(aFilename) {
		for (var lIdx = 0; lIdx < this.queue.length; lIdx++) {
			if (this.queue[lIdx].getName() === aFilename) {
				this.queue[lIdx].setStatus(this.STATUS_PAUSED);
			}
		}
	},
	resumeUpload: function(aFilename) {
		var lUploadItem = this.getFile(aFilename);
		lUploadItem.setStatus(this.STATUS_READY);
		// If the item will be uploaded in chunks or not
		if (lUploadItem.getChunked()) {
			// Additional parameter to tell the chunking system that the upload 
			// will continue
			this.uploadFileInChunks(lUploadItem, true);
		} else {
			this.uploadCompleteFile(lUploadItem);
		}
	}
};

// add the jWebSocket FileSystem PlugIn into the TokenClient class
jws.oop.addPlugIn(jws.jWebSocketTokenClient, jws.FileUploaderPlugIn);

jws.oop.declareClass('jws', 'UploadItem', null, {
	status: null,
	progress: 0,
	file: null,
	isChunked: null,
	uploadPaused: null,
	create: function(aFile) {
		this.name = aFile.name;
		this.file = aFile;
		this.progress = 0;
		this.status = jws.FileUploaderPlugIn.STATUS_READY,
				this.isChunked = true;
		this.uploadPaused = false;
	},
	setChunkSize: function(aChunkSize) {
		this.chunkSize = aChunkSize;
	},
	setUploadedBytes: function(aBytes) {
		this.uploadedBytes = aBytes;
	},
	getChunkSize: function() {
		return this.chunkSize;
	},
	getUploadedBytes: function(aBytes) {
		return this.uploadedBytes;
	},
	getName: function() {
		return this.name;
	},
	setFile: function(aFile) {
		this.file = aFile;
	},
	getFile: function() {
		return this.file;
	},
	getProperty: function(aPropName) {
		if (this.file && this.file[aPropName]) {
			return this.file[aPropName];
		}
		return null;
	},
	setProgress: function(aProgress) {
		this.progress = aProgress;
	},
	/*
	 * Indicates wether the item will be uploaded in chunks or not
	 * @return isChunked:Boolean
	 */
	getChunked: function() {
		return this.isChunked;
	},
	/*
	 * Tells to the uploader that the item will be uploaded in chunks
	 * @return isChunked:Boolean
	 */
	setChunked: function(aChunked) {
		this.isChunked = aChunked;
	},
	getProgress: function() {
		return this.progress = parseInt(this.uploadedBytes * 100 / this.getFile().size);
	},
	setStatus: function(aStatus) {
		this.status = aStatus;
	},
	getStatus: function() {
		return this.status;
	}
});