//	---------------------------------------------------------------------------
//	jWebSocket PendingResponseQueueItem (Community Edition, CE)
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
package org.jwebsocket.token;

/**
 *
 * @author Alexander Schulze
 */
public class PendingResponseQueueItem {

	private Token mToken = null;
	private WebSocketResponseTokenListener mListener = null;

	/**
	 *
	 * @param aToken
	 * @param aListener
	 */
	public PendingResponseQueueItem(Token aToken,
			WebSocketResponseTokenListener aListener) {
		mToken = aToken;
		mListener = aListener;
	}

	/**
	 * @return the mToken
	 */
	public Token getToken() {
		return mToken;
	}

	/**
	 *
	 * @param aToken
	 */
	public void setToken(Token aToken) {
		this.mToken = aToken;
	}

	/**
	 * @return the mListener
	 */
	public WebSocketResponseTokenListener getListener() {
		return mListener;
	}

	/**
	 * @param aListener
	 */
	public void setListener(WebSocketResponseTokenListener aListener) {
		this.mListener = aListener;
	}
}
