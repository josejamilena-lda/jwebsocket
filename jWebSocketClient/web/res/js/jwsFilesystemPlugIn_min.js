
//	---------------------------------------------------------------------------
//	jWebSocket Filesystem plug-in (Community Edition, CE)
//	---------------------------------------------------------------------------
//	Copyright 2010-2015 Innotrade GmbH (jWebSocket.org)
//	Alexander Schulze, Germany (NRW)
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
jws.FileSystemPlugIn={NS:jws.NS_BASE+".plugins.filesystem",ALIAS_PRIVATE:"privateDir",ALIAS_PUBLIC:"publicDir",kZ:"sessionDir",kJ:"uuidDir",NOT_FOUND_ERR:1,SECURITY_ERR:2,ABORT_ERR:3,NOT_READABLE_ERR:4,ENCODING_ERR:5,NO_MODIFICATION_ALLOWED_ERR:6,INVALID_STATE_ERR:7,SYNTAX_ERR:8,INVALID_MODIFICATION_ERR:9,QUOTA_EXCEEDED_ERR:10,TYPE_MISMATCH_ERR:11,PATH_EXISTS_ERR:12,processToken:function(aR){if(aR.ns===jws.FileSystemPlugIn.NS){if("load"===aR.reqType){if(0===aR.code){if(this.OnFileLoaded){this.OnFileLoaded(aR);}}else{if(this.OnFileError){this.OnFileError(aR);}}}else if("send"===aR.reqType){if(0===aR.code){if(this.OnFileSent){this.OnFileSent(aR);}}else{if(this.OnFileError){this.OnFileError(aR);}}}else if("event"===aR.type){if("filesaved"===aR.name){if(this.OnFileSaved){this.OnFileSaved(aR);}}else if("filereceived"===aR.name){if(this.OnFileReceived){this.OnFileReceived(aR);}}else if("filedeleted"===aR.name){if(this.OnFileDeleted){this.OnFileDeleted(aR);}}}}},fileGetFilelist:function(hJ,hd,ax){var bj=this.checkConnected();if(0===bj.code){ax=jws.getOptions(ax,{path:null,recursive:false,includeDirs:false});var cg={ns:jws.FileSystemPlugIn.NS,type:"getFilelist",alias:hJ,recursive:ax.recursive,includeDirs:ax.includeDirs,filemasks:hd,path:ax.path};this.sendToken(cg,ax);}return bj;},fileDelete:function(bB,fR,ax){ax=jws.getOptions(ax,{scope:jws.SCOPE_PRIVATE,notify:false});var bj=this.checkConnected();if(0===bj.code){var cg={ns:jws.FileSystemPlugIn.NS,type:"delete",filename:bB,force:fR,notify:(jws.SCOPE_PUBLIC===ax.scope)&&ax.notify,scope:ax.scope};if("undefined"!==typeof ax.alias){cg.alias=ax.alias;}this.sendToken(cg,ax);}return bj;},fileExists:function(bB,hJ,ax){var bj=this.checkConnected();if(0===bj.code){var cg={ns:jws.FileSystemPlugIn.NS,type:"exists",filename:bB,alias:hJ};this.sendToken(cg,ax);}return bj;},fileLoad:function(bB,hJ,ax){var bj=this.createDefaultResult();ax=jws.getOptions(ax,{encoding:"base64"});if(this.isConnected()){var cg={ns:jws.FileSystemPlugIn.NS,type:"load",alias:hJ,filename:bB};if(ax.encoding){cg.encoding=ax.encoding;}this.sendToken(cg,ax);}else{bj.code= -1;bj.localeKey="jws.jsc.res.notConnected";bj.msg="Not connected.";}return bj;},ih:function(bB,aw,ax){var bj=this.createDefaultResult();ax=jws.getOptions(ax,{encoding:"base64",encode:true,notify:false,scope:jws.SCOPE_PRIVATE});var dp=null;if(ax.append){dp="append";}else{dp="save";}if(!dp){bj.code= -1;bj.msg="No save/append option passed.";return bj;}var ji={};if(ax.encode){ji.data=ax.encoding;}if(this.isConnected()){var cg={ns:jws.FileSystemPlugIn.NS,type:dp,enc:ji,scope:ax.scope,encoding:ax.encoding,encode:ax.encode,notify:(jws.SCOPE_PUBLIC===ax.scope)&&ax.notify,data:aw,filename:bB};if(ax.alias){cg.alias=ax.alias;}this.sendToken(cg,ax);}else{bj.code= -1;bj.localeKey="jws.jsc.res.notConnected";bj.msg="Not connected.";}return bj;},fileSave:function(bB,aw,ax){if(!ax){ax={};}ax.append=false;return this.ih(bB,aw,ax);},fileAppend:function(bB,aw,ax){if(!ax){ax={};}ax.append=true;return this.ih(bB,aw,ax);},fileSend:function(dW,bB,aw,ax){var dY=false;var bs="base64";var gV=true;if(ax){bs=ax["encoding"]||"base64";if(ax.isNode!==undefined){dY=ax.isNode;}if(ax.encode!==undefined){gV=ax.encode;}}var bj=this.checkConnected();if(0===bj.code){var ji={};if(gV){ji.data=bs;}var cg={ns:jws.FileSystemPlugIn.NS,type:"send",data:aw,enc:ji,encode:gV,encoding:bs,filename:bB};if(dY){cg.unid=dW;}else{cg.targetId=dW;}this.sendToken(cg,ax);}return bj;},fileGetErrorMsg:function(eY){var dm="unkown";switch(eY){case jws.FileSystemPlugIn.NOT_FOUND_ERR:{dm="NOT_FOUND_ERR";break;}case jws.FileSystemPlugIn.SECURITY_ERR:{dm="SECURITY_ERR";break;}case jws.FileSystemPlugIn.ABORT_ERR:{dm="ABORT_ERR";break;}case jws.FileSystemPlugIn.NOT_READABLE_ERR:{dm="NOT_READABLE_ERR";break;}case jws.FileSystemPlugIn.ENCODING_ERR:{dm="ENCODING_ERR";break;}case jws.FileSystemPlugIn.NO_MODIFICATION_ALLOWED_ERR:{dm="NO_MODIFICATION_ALLOWED_ERR";break;}case jws.FileSystemPlugIn.INVALID_STATE_ERR:{dm="INVALID_STATE_ERR";break;}case jws.FileSystemPlugIn.SYNTAX_ERR:{dm="SYNTAX_ERR";break;}case jws.FileSystemPlugIn.INVALID_MODIFICATION_ERR:{dm="INVALID_MODIFICATION_ERR";break;}case jws.FileSystemPlugIn.QUOTA_EXCEEDED_ERR:{dm="QUOTA_EXCEEDED_ERR";break;}case jws.FileSystemPlugIn.TYPE_MISMATCH_ERR:{dm="TYPE_MISMATCH_ERR";break;}case jws.FileSystemPlugIn.PATH_EXISTS_ERR:{dm="PATH_EXISTS_ERR";break;}}return dm;},fileLoadLocal:function(ds,ax){var bj={code:0,msg:"ok"};if(!ds|| !ds.files){return{code: -1,msg:"No input file element passed."};}if(undefined===window.FileReader){return{code: -1,msg:"Your browser does not yet support the HTML5 File jQ."};}if(!ax){ax={};}ax.encoding="base64";var cH=ds.files;if(!cH|| !cH.length){return{code: -1,msg:"No files selected."};}for(var db=0,dB=cH.length;db<dB;db++){var dw=cH[db];var dh=new FileReader();var dJ=this;dh.onload=(function(cw){return function(cz){if(dJ.OnLocalFileRead||ax.OnSuccess){var cg={encoding:ax.encoding,fileName:(cw.fileName?cw.fileName:cw.name),fileSize:(cw.fileSize?cw.fileSize:cw.size),type:cw.type,lastModified:cw.lastModifiedDate,data:cz.target.result};if(ax.args){cg.args=ax.args;}if(ax.action){cg.action=ax.action;}}if(dJ.OnLocalFileRead){dJ.OnLocalFileRead(cg);}if(ax.OnSuccess){ax.OnSuccess(cg);}};})(dw);dh.onerror=(function(cw){return function(cz){if(dJ.OnLocalFileError||ax.OnFailure){var dn=cz.target.error.code;var cg={code:dn,msg:dJ.fileGetErrorMsg(dn)};if(ax.args){cg.args=ax.args;}if(ax.action){cg.action=ax.action;}}if(dJ.OnLocalFileError){dJ.OnLocalFileError(cg);}if(ax.OnFailure){ax.OnFailure(cg);}};})(dw);try{dh.readAsDataURL(dw);}catch(dQ){if(dJ.OnLocalFileError||ax.OnFailure){var cg={code: -1,msg:dQ.message};if(ax.args){cg.args=ax.args;}if(ax.action){cg.action=ax.action;}}if(dJ.OnLocalFileError){dJ.OnLocalFileError(cg);}if(ax.OnFailure){ax.OnFailure(cg);}}}return bj;},setFileSystemCallbacks:function(ci){if(!ci){ci={};}if(ci.OnFileLoaded!==undefined){this.OnFileLoaded=ci.OnFileLoaded;}if(ci.OnFileSaved!==undefined){this.OnFileSaved=ci.OnFileSaved;}if(ci.OnFileDeleted!==undefined){this.OnFileDeleted=ci.OnFileDeleted;}if(ci.OnFileReceived!==undefined){this.OnFileReceived=ci.OnFileReceived;}if(ci.OnFileSent!==undefined){this.OnFileSent=ci.OnFileSent;}if(ci.OnFileError!==undefined){this.OnFileError=ci.OnFileError;}if(ci.OnLocalFileRead!==undefined){this.OnLocalFileRead=ci.OnLocalFileRead;}if(ci.OnLocalFileError!==undefined){this.OnLocalFileError=ci.OnLocalFileError;}}};jws.oop.addPlugIn(jws.jWebSocketTokenClient,jws.FileSystemPlugIn); 