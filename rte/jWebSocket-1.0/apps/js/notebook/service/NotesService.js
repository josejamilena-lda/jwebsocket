//	---------------------------------------------------------------------------
//	jWebSocket Notebook script app demo (Community Edition, CE)
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
NotesService = {
	initialize: function(){
		this.mongo = new Packages.com.mongodb.MongoClient('localhost');
		this.database = this.mongo.getDB('notebook_db');
		this.collection = this.database.getCollection('notes');
		
		App.getLogger().debug('NotesService: Initialized successfully!');
	},
	add: function(aUser, aTitle, aBody){
		this.collection.insert(MongoDBUtils.toDBObject({
			user: aUser,
			title: aTitle,
			body: aBody,
			created_at: new Date().getTime(),
			edited_at: new Date().getTime()
		}));
	},
	edit: function(aUser, aNoteId, aTitle, aBody){
		this.collection.update(MongoDBUtils.toDBObject({
			_id: MongoDBUtils.toId(aNoteId),
			user: aUser
		}), MongoDBUtils.toDBObject({
			'$set': MongoDBUtils.toDBObject({
				title: aTitle,
				body: aBody,
				edited_at: new Date().getTime()
			})
		}));
	},
	list: function(aUser, aOffset, aLength){
		var lCursor = this.collection.find(MongoDBUtils.toDBObject({
			user: aUser
		})).skip(aOffset).limit(aLength);
		
		var lNotes = []
		while (lCursor.hasNext()){
			lNotes.push(lCursor.next().toMap());
		}
		
		return lNotes;
	}, 
	remove: function(aUser, aNoteId){
		this.collection.remove(MongoDBUtils.toDBObject({
			_id: MongoDBUtils.toId(aNoteId),
			user: aUser
		}));
	},
	shutdown: function(){
		this.mongo.close();
		
		App.getLogger().debug('NotesService: Shutdown successfully!');
	}
}