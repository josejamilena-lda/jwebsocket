//	---------------------------------------------------------------------------
//	jWebSocket - WebSocketDemo (Community Edition, CE)
//	---------------------------------------------------------------------------
//	Copyright 2010-2013 Innotrade GmbH (jWebSocket.org), Germany (NRW), Herzogenrath
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
package org.jwebsocket.appserver;

import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.log4j.Logger;
import org.jwebsocket.api.WebSocketPacket;
import org.jwebsocket.factory.JWebSocketFactory;
import org.jwebsocket.kit.WebSocketServerEvent;
import org.jwebsocket.listener.WebSocketServerTokenEvent;
import org.jwebsocket.listener.WebSocketServerTokenListener;
import org.jwebsocket.logging.Logging;
import org.jwebsocket.server.TokenServer;
import org.jwebsocket.token.Token;

/**
 *
 * @author aschulze
 */
public class WebSocketDemo extends HttpServlet implements WebSocketServerTokenListener {

	private static final long serialVersionUID = 1L;
	private static Logger mLog = null;

	/**
	 * Processes requests for both HTTP <code>GET</code> and <code>POST</code> methods.
	 * @param aRequest servlet request
	 * @param aResponse servlet response
	 * @throws ServletException if a servlet-specific error occurs
	 * @throws IOException if an I/O error occurs
	 */
	protected void processRequest(HttpServletRequest aRequest, HttpServletResponse aResponse)
			throws ServletException, IOException {
		aResponse.setContentType("text/plain;charset=UTF-8");
		PrintWriter lOut = aResponse.getWriter();

		try {
			lOut.println("This session: " + aRequest.getSession().getId());
			lOut.println("Http sessions: " + WebSocketHttpSessionMerger.getHttpSessionsCSV());
			lOut.println("WebSocket sessions: " + WebSocketHttpSessionMerger.getWebSocketSessionsCSV());
		} finally {
			lOut.close();
		}
	}

	@Override
	public void init() {
		mLog = Logging.getLogger(WebSocketDemo.class);
		mLog.info("Adding servlet '" + getClass().getSimpleName() + "' to WebSocket listeners...");
		TokenServer lServer = JWebSocketFactory.getTokenServer();
		if (lServer != null) {
			lServer.addListener(this);
		}
	}

	@Override
	public void processOpened(WebSocketServerEvent aEvent) {
		mLog.info("Opened WebSocket session: " + aEvent.getSession().getSessionId());
		// if a new web socket connection has been started,
		// update the session tables accordingly
		WebSocketHttpSessionMerger.addWebSocketSession(aEvent.getSession());
	}

	@Override
	public void processPacket(WebSocketServerEvent aEvent, WebSocketPacket aPacket) {
		mLog.info("Received WebSocket packet: " + aPacket.getASCII());
	}

	@Override
	public void processToken(WebSocketServerTokenEvent aEvent, Token aToken) {
		mLog.info("Received WebSocket token: " + aToken.toString());
	}

	@Override
	public void processClosed(WebSocketServerEvent aEvent) {
		mLog.info("Closed WebSocket session: " + aEvent.getSession().getSessionId());
		// if a web socket connection has been terminated,
		// update the session tables accordingly
		WebSocketHttpSessionMerger.removeWebSocketSession(aEvent.getSession());
	}

	// <editor-fold defaultstate="collapsed" desc="HttpServlet methods. Click on the + sign on the left to edit the code.">
	/**
	 * Handles the HTTP <code>GET</code> method.
	 * @param aRequest servlet request
	 * @param aResponse servlet response
	 * @throws ServletException if a servlet-specific error occurs
	 * @throws IOException if an I/O error occurs
	 */
	@Override
	protected void doGet(HttpServletRequest aRequest, HttpServletResponse aResponse)
			throws ServletException, IOException {
		processRequest(aRequest, aResponse);
	}

	/**
	 * Handles the HTTP <code>POST</code> method.
	 * @param aRequest servlet request
	 * @param aResponse servlet response
	 * @throws ServletException if a servlet-specific error occurs
	 * @throws IOException if an I/O error occurs
	 */
	@Override
	protected void doPost(HttpServletRequest aRequest, HttpServletResponse aResponse)
			throws ServletException, IOException {
		processRequest(aRequest, aResponse);
	}

	/**
	 * Returns a short description of the servlet.
	 * @return a String containing servlet description
	 */
	@Override
	public String getServletInfo() {
		return "Short description";
	}// </editor-fold>
}
