//  ---------------------------------------------------------------------------
//  jWebSocket - ChannelException
//  Copyright (c) 2010 Innotrade GmbH, jWebSocket.org
//  ---------------------------------------------------------------------------
//  This program is free software; you can redistribute it and/or modify it
//  under the terms of the GNU Lesser General Public License as published by the
//  Free Software Foundation; either version 3 of the License, or (at your
//  option) any later version.
//  This program is distributed in the hope that it will be useful, but WITHOUT
//  ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
//  FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for
//  more details.
//  You should have received a copy of the GNU Lesser General Public License along
//  with this program; if not, see <http://www.gnu.org/licenses/lgpl.html>.
//  ---------------------------------------------------------------------------

package org.jwebsocket.plugins.channels;

/**
 * Channel related exception class
 * @author puran
 * @version $Id:$
 */
public class ChannelException extends Exception {
	public ChannelException(String error) {
		super(error);
	}

	public ChannelException(Throwable error) {
		super(error);
	}

	public ChannelException(String error, Throwable throwable) {
		super(error, throwable);
	}

	private static final long serialVersionUID = 1L;
}
