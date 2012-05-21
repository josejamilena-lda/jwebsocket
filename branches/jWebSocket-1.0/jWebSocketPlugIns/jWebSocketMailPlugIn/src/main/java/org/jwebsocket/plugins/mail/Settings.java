//	---------------------------------------------------------------------------
//	jWebSocket - jWebSocket Settings for Filesystem Plug-in
//  Copyright (c) 2012 Innotrade GmbH, jWebSocket.org
//	---------------------------------------------------------------------------
//	This program is free software; you can redistribute it and/or modify it
//	under the terms of the GNU Lesser General Public License as published by the
//	Free Software Foundation; either version 3 of the License, or (at your
//	option) any later version.
//	This program is distributed in the hope that it will be useful, but WITHOUT
//	ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
//	FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for
//	more details.
//	You should have received a copy of the GNU Lesser General Public License along
//	with this program; if not, see <http://www.gnu.org/licenses/lgpl.html>.
//	---------------------------------------------------------------------------
package org.jwebsocket.plugins.mail;

import org.jwebsocket.config.JWebSocketConfig;
import org.jwebsocket.config.JWebSocketServerConstants;
import org.jwebsocket.storage.BaseStorage;

/**
 *
 * @author aschulze
 */
public class Settings {

	private BaseStorage mBaseStorage = null;
	private String mSmtpHost = null;
	private Integer mSmtpPort = null;
	private Boolean mSmtpAuth = null;
	private String mSmtpUser = null;
	private String mSmtpPassword = null;
	private Boolean mSmtpPop3Before = null;
	private String mPop3Host = null;
	private Integer mPop3Port = null;
	private String mPop3User = null;
	private String mPop3Password = null;
	private String mMailRoot = null;
	private String mRarPath = null;

	/**
	 * @return the smtpHost
	 */
	public String getSmtpHost() {
		return (null == mSmtpHost ? "localhost" : mSmtpHost);
	}

	/**
	 * @param aSmtpHost the smtpHost to set
	 */
	public void setSmtpHost(String aSmtpHost) {
		mSmtpHost = aSmtpHost;
	}

	/**
	 * @return the smtpPort
	 */
	public Integer getSmtpPort() {
		return (null == mSmtpPort ? 25 : mSmtpPort);
	}

	/**
	 * @param aSmtpPort the smtpPort to set
	 */
	public void setSmtpPort(Integer aSmtpPort) {
		mSmtpPort = aSmtpPort;
	}

	/**
	 * @return the smtpAuth
	 */
	public Boolean getSmtpAuth() {
		return (null == mSmtpAuth ? true : mSmtpAuth);
	}

	/**
	 * @param aSmtpAuth the smtpAuth to set
	 */
	public void setSmtpAuth(Boolean aSmtpAuth) {
		mSmtpAuth = aSmtpAuth;
	}

	/**
	 * @return the smtpUser
	 */
	public String getSmtpUser() {
		return mSmtpUser;
	}

	/**
	 * @param aSmtpUser the smtpUser to set
	 */
	public void setSmtpUser(String aSmtpUser) {
		mSmtpUser = aSmtpUser;
	}

	/**
	 * @return the smtpPassword
	 */
	public String getSmtpPassword() {
		return mSmtpPassword;
	}

	/**
	 * @param aSmtpPassword the smtpPassword to set
	 */
	public void setSmtpPassword(String aSmtpPassword) {
		mSmtpPassword = aSmtpPassword;
	}

	/**
	 * @return the smtpPop3before
	 */
	public Boolean getSmtpPop3Before() {
		return (null == mSmtpPop3Before ? false : mSmtpPop3Before);
	}

	/**
	 * @param aSmtpPop3Before the smtpPop3before to set
	 */
	public void setSmtpPop3Before(Boolean aSmtpPop3Before) {
		mSmtpPop3Before = aSmtpPop3Before;
	}

	/**
	 * @return the pop3Host
	 */
	public String getPop3Host() {
		return (null == mPop3Host ? "localhost" : mPop3Host);
	}

	/**
	 * @param aPop3Host the pop3Host to set
	 */
	public void setPop3Host(String aPop3Host) {
		mPop3Host = aPop3Host;
	}

	/**
	 * @return the pop3Port
	 */
	public Integer getPop3Port() {
		return (null == mPop3Port ? 110 : mPop3Port);
	}

	/**
	 * @param aPop3Port the pop3Port to set
	 */
	public void setPop3Port(Integer aPop3Port) {
		mPop3Port = aPop3Port;
	}

	/**
	 * @return the pop3User
	 */
	public String getPop3User() {
		return mPop3User;
	}

	/**
	 * @param aPop3User the pop3User to set
	 */
	public void setPop3User(String aPop3User) {
		mPop3User = aPop3User;
	}

	/**
	 * @return the pop3Password
	 */
	public String getPop3Password() {
		return mPop3Password;
	}

	/**
	 * @param aPop3Password the pop3Password to set
	 */
	public void setPop3Password(String aPop3Password) {
		mPop3Password = aPop3Password;
	}

	/**
	 * @return the mailRoot
	 */
	public String getMailRoot() {
		// apply default setting if option is not given in spring config
		return (null == mMailRoot
				? "${" + JWebSocketServerConstants.JWEBSOCKET_HOME + "}conf/MailPlugIn/mails/{username}/"
				: mMailRoot);
	}

	/**
	 * @param aMailRoot the mailRoot to set
	 */
	public void setMailRoot(String aMailRoot) {
		mMailRoot = JWebSocketConfig.expandEnvAndJWebSocketVars(aMailRoot);
	}

	/**
	 * @return the RarPath
	 */
	public String getRarPath() {
		return mRarPath;
	}

	/**
	 * @param aRarPath
	 */
	public void setRarPath(String aRarPath) {
		mRarPath = aRarPath;
	}

	/**
	 * @return the mBaseStorage
	 */
	public BaseStorage getStorage() {
		return mBaseStorage;
	}

	/**
	 *
	 * @param aBaseStorage
	 */
	public void setStorage(BaseStorage aBaseStorage) {
		mBaseStorage = aBaseStorage;
	}
}
