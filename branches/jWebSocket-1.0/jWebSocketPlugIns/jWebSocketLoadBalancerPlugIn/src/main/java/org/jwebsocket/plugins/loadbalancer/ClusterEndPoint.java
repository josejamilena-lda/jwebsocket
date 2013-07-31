//	---------------------------------------------------------------------------
//	jWebSocket Load Balancer ClusterEndPoint (Community Edition, CE)
//	---------------------------------------------------------------------------
//	Copyright 2010-2013 Innotrade GmbH (jWebSocket.org)
//      Alexander Schulze, Germany (NRW)
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
package org.jwebsocket.plugins.loadbalancer;

import org.jwebsocket.api.WebSocketConnector;

/**
 * Specifies one single endpoint of a certain cluster.
 *
 * @author aschulze
 * @author rbetancourt
 */
public class ClusterEndPoint {

	private EndPointStatus mStatus = EndPointStatus.OFFLINE;
	private WebSocketConnector mConnector = null;
	private int mRequests = 0;

	/**
	 * @return the mStatus
	 */
	public EndPointStatus getStatus() {
		return mStatus;
	}

	/**
	 * @param aStatus the mStatus to set
	 */
	public void setStatus(EndPointStatus aStatus) {
		mStatus = aStatus;
	}

	/**
	 * @return the mConnector
	 */
	public WebSocketConnector getConnector() {
		return mConnector;
	}

	/**
	 * @param aConnector the mConnector to set
	 */
	public void setConnector(WebSocketConnector aConnector) {
		this.mConnector = aConnector;
	}

	/**
	 *
	 * @return
	 */
	public String getServiceID() {
		return (mConnector != null ? "myService_" + mConnector.getId() : null);
	}

	/**
	 *
	 */
	public void increaseRequests() {
		mRequests++;
	}

	/**
	 *
	 * @return
	 */
	public int getRequests() {
		return mRequests;
	}

	/**
	 *
	 * @param aRequests
	 */
	public void setRequests(int aRequests) {
		this.mRequests = aRequests;
	}
}
