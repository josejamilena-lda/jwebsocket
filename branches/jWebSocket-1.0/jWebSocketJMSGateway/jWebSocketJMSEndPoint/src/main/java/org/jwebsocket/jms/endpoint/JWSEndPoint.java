//	---------------------------------------------------------------------------
//	jWebSocket - JMS Gateway Client (Community Edition, CE)
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
package org.jwebsocket.jms.endpoint;

import javax.jms.JMSException;

/**
 *
 * @author Alexander Schulze
 */
public class JWSEndPoint extends JMSEndPoint {

	// private constructor, public API only allows contructors 
	// with arguments, see below.
	private JWSEndPointMessageListener mListener;

	private JWSEndPointSender mSender;

	/**
	 *
	 */
	protected JWSEndPoint() {
	}

	/**
	 *
	 * @param aBrokerURI
	 * @param aGatewayTopic
	 * @param aGatewayId
	 * @param aEndPointId
	 * @param aThreadPoolSize
	 * @param aDurable
	 */
	public JWSEndPoint(String aBrokerURI, String aGatewayTopic,
			String aGatewayId, String aEndPointId, int aThreadPoolSize,
			boolean aDurable) {
		super(aBrokerURI, aGatewayTopic,
				aGatewayId, aEndPointId, aThreadPoolSize,
				aDurable);
	}

	/**
	 *
	 * @param aBrokerURI
	 * @param aGatewayTopic
	 * @param aGatewayId
	 * @param aEndPointId
	 * @param aThreadPoolSize
	 * @param aDurable
	 * @return
	 * @throws JMSException
	 */
	public static JWSEndPoint getInstance(String aBrokerURI, String aGatewayTopic,
			String aGatewayId, String aEndPointId, int aThreadPoolSize,
			boolean aDurable) throws JMSException {
		// create an "empty" endpoint instance
		JWSEndPoint lEP = new JWSEndPoint();
		// and initialize it
		// checking for duplicate endpoints and raising exception if such
		lEP.init(aBrokerURI, aGatewayTopic,
				aGatewayId, aEndPointId, aThreadPoolSize,
				aDurable);

		lEP.setListener(new JWSEndPointMessageListener(lEP));
		lEP.setSender(new JWSEndPointSender(lEP));
		lEP.getListener().setSender(lEP.getSender());
		lEP.addListener(lEP.getListener());

		// return JMS Endpoint instance in case of success
		return lEP;
	}

	public JWSEndPointMessageListener getListener() {
		return mListener;
	}

	public void setListener(JWSEndPointMessageListener aListener) {
		mListener = aListener;
	}

	public JWSEndPointSender getSender() {
		return mSender;
	}

	public void setSender(JWSEndPointSender aSender) {
		mSender = aSender;
	}

	/**
	 * Adds a new listener to listen to requests from other endpoints. You can
	 * only assign one request listener per name space / type combination. If
	 * you register a listener that already exists, this will overwrite the
	 * previous one. A request token usually contains a name space, a type, a
	 * unique token-id an additional arbitrary payload. The entire token is
	 * passed to the listener to process it according to the application needs.
	 *
	 * @param aNS the name space of the request to listen on
	 * @param aType the type of the request to listen on
	 * @param aListener the actual listener instance, must implement the
	 * IJWSMessageListener interface
	 */
	public void addRequestListener(String aNS, String aType,
			IJWSMessageListener aListener) {
		mListener.addRequestListener(aNS, aType, aListener);
	}

	/**
	 * Removes an existing request listener from the endpoint. After that the
	 * listener is not invoked anymore, such that the application will not react
	 * anymore on the specified requests.
	 *
	 * @param aNS the name space of the request to listen on
	 * @param aType the type of the request to listen on
	 * @return the reference the listener object if such, otherwise
	 * <tt>null</tt>.
	 */
	public IJWSMessageListener removeRequestListener(String aNS, String aType) {
		return mListener.removeRequestListener(aNS, aType);
	}

	/**
	 * Checks if a request listener for a certain name space / type combination
	 * is already registered for the endpoint.
	 *
	 * @param aNS the name space of the request to listen on
	 * @param aType the type of the request to listen on
	 * @return <tt>true</tt>if already a listener exists with the given name
	 * space / type combination, otherwise <tt>false</tt>.
	 */
	public boolean hasRequestListener(String aNS, String aType) {
		return mListener.hasRequestListener(aNS, aType);
	}

	/**
	 * Adds a new listener to listen to responses from other endpoints. You can
	 * only assign one response listener per name space / type combination. If
	 * you register a listener that already exists, this will overwrite the
	 * previous one. A response token usually contains a name space, a reqType,
	 * a unique token-id, the type "response" and an additional arbitrary
	 * payload. The entire token is passed to the listener to process it
	 * according to the application needs.
	 *
	 * @param aNS the name space of the request to listen on
	 * @param aReqType the type of the response (type of the previous request)
	 * to listen on
	 * @param aListener the actual listener instance, must implement the
	 * IJWSMessageListener interface
	 */
	public void addResponseListener(String aNS, String aReqType,
			IJWSMessageListener aListener) {
		mListener.addResponseListener(aNS, aReqType, aListener);
	}

	/**
	 * Removes an existing response listener from the endpoint. After that the
	 * listener is not invoked anymore, such that the application will not react
	 * anymore on the specified responses.
	 *
	 * @param aNS the name space of the request to listen on
	 * @param aReqType the type of the response (type of the previous request)
	 * to listen on
	 * @return the reference the listener object if such, otherwise
	 * <tt>null</tt>.
	 */
	public IJWSMessageListener removeResponseListener(String aNS, String aReqType) {
		return mListener.removeResponseListener(aNS, aReqType);
	}

	/**
	 * Checks if a response listener for a certain name space / type combination
	 * is already registered for the endpoint.
	 *
	 * @param aNS the name space of the request to listen on
	 * @param aReqType the type of the request to listen on
	 * @return <tt>true</tt>if already a listener exists with the given name
	 * space / type combination, otherwise <tt>false</tt>.
	 */
	public boolean hasResponseListener(String aNS, String aReqType) {
		return mListener.hasResponseListener(aNS, aReqType);
	}

}
