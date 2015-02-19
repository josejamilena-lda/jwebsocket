//	---------------------------------------------------------------------------
//	jWebSocket - EhCacheStorageProvider (Community Edition, CE)
//	---------------------------------------------------------------------------
//	Copyright 2010-2014 Innotrade GmbH (jWebSocket.org)
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
package org.jwebsocket.storage.ehcache;

import org.jwebsocket.api.IBasicStorage;
import org.jwebsocket.api.IStorageProvider;

/**
 * Provides a getStorage method to return an EhCache storage with a given name.
 *
 * @author Rolando Santamaria Maso, Alexander Schulze
 */
public class EhCacheStorageProvider implements IStorageProvider {

	@Override
	public IBasicStorage<String, Object> getStorage(String aName) throws Exception {
		EhCacheStorage lStorage = new EhCacheStorage(aName);
		lStorage.initialize();

		return lStorage;
	}

	@Override
	public void removeStorage(String aName) throws Exception {
		EhCacheManager.getInstance().removeCache(aName);
	}
}