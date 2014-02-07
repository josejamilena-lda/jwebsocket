//	---------------------------------------------------------------------------
//	jWebSocket - Sample Filter (Community Edition, CE)
//	---------------------------------------------------------------------------
//	Copyright 2010-2014 Innotrade GmbH (jWebSocket.org)
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
package org.jwebsocket.filters.sample;

import org.apache.log4j.Logger;
import org.jwebsocket.api.FilterConfiguration;
import org.jwebsocket.api.WebSocketConnector;
import org.jwebsocket.filter.TokenFilter;
import org.jwebsocket.kit.FilterResponse;
import org.jwebsocket.logging.Logging;
import org.jwebsocket.server.TokenServer;
import org.jwebsocket.token.Token;

/**
 *
 * @author aschulze
 */
public class SampleFilter extends TokenFilter {

	private static final Logger mLog = Logging.getLogger();

	/**
	 *
	 * @param aConfig
	 */
	public SampleFilter(FilterConfiguration aConfig) {
		super(aConfig);
		if (mLog.isDebugEnabled()) {
			mLog.debug("Instantiating sample filter...");
		}
	}

	/**
	 *
	 * @param aResponse
	 * @param aConnector
	 * @param aToken
	 */
	@Override
	public void processTokenIn(FilterResponse aResponse,
			WebSocketConnector aConnector, Token aToken) {
		if (mLog.isDebugEnabled()) {
			mLog.debug("Checking incoming token from "
					+ (aConnector != null ? aConnector.getId() : "[not given]")
					+ ": " + Logging.getTokenStr(aToken) + "...");
		}

		TokenServer lServer = (TokenServer) getServer();
		// String lUsername = lServer.getUsername(aConnector);

		// TODO: very first security test, replace by user's locked state!
		/*
		 if (<condition>) {
		 Token lToken = lServer.createAccessDenied(aToken);
		 lServer.sendToken(aConnector, lToken);
		 aResponse.rejectMessage();
		 return;
		 }
		 */
	}

	/**
	 *
	 * @param aResponse
	 * @param aSource
	 * @param aTarget
	 * @param aToken
	 */
	@Override
	public void processTokenOut(FilterResponse aResponse,
			WebSocketConnector aSource, WebSocketConnector aTarget,
			Token aToken) {
		if (mLog.isDebugEnabled()) {
			mLog.debug("Checking outgoing token from "
					+ (aSource != null ? aSource.getId() : "[not given]")
					+ " to "
					+ (aTarget != null ? aTarget.getId() : "[not given]")
					+ ": " + Logging.getTokenStr(aToken) + "...");
		}
	}
}
