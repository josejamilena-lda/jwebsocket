//	---------------------------------------------------------------------------
//	jWebSocket - JavaScriptApp for Scripting Plug-in (Community Edition, CE)
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
package org.jwebsocket.plugins.scripting.app.js;

import java.io.File;
import java.security.PrivilegedAction;
import javax.script.Invocable;
import javax.script.ScriptEngine;
import org.apache.commons.io.FileUtils;
import org.apache.log4j.Logger;
import org.jwebsocket.config.JWebSocketConfig;
import org.jwebsocket.factory.LocalLoader;
import org.jwebsocket.logging.Logging;
import org.jwebsocket.plugins.scripting.ScriptingPlugIn;
import org.jwebsocket.plugins.scripting.Settings;
import org.jwebsocket.plugins.scripting.app.BaseScriptApp;
import org.jwebsocket.spring.JWebSocketBeanFactory;
import org.jwebsocket.util.Tools;
import org.springframework.util.Assert;

/**
 * The class represents the "App" global object in the JavaScript application.
 * Contains specific JavaScript implementation for abstract methods of the
 * BaseScriptApp class.
 *
 * @author kyberneees
 */
public class JavaScriptApp extends BaseScriptApp {

	private Logger mLog = Logging.getLogger();
	private final Object mApp;

	/**
	 * Constructor
	 *
	 * @param aServer The ScriptingPlugIn reference that allows to script
	 * applications to get access to the TokenServer instance.
	 * @param aAppName The application name (unique value)
	 * @param aAppPath The application directory path
	 * @param aScriptApp The scripting engine that runs the application
	 * @param aLoader The application class loader
	 */
	public JavaScriptApp(ScriptingPlugIn aServer, String aAppName, String aAppPath, ScriptEngine aScriptApp, LocalLoader aLoader) {
		super(aServer, aAppName, aAppPath, aScriptApp, aLoader);

		try {
			File lAppTemplate = new File(JWebSocketConfig.getConfigFolder("ScriptingPlugIn/js/AppTemplate.js"));
			if (!lAppTemplate.exists()) {
				throw new RuntimeException("The JavaScript application template does not exists in expected location: "
						+ lAppTemplate.getPath() + "!");
			}
			// loading app
			aScriptApp.eval(FileUtils.readFileToString(lAppTemplate));
			mApp = aScriptApp.get("App");
		} catch (Exception lEx) {
			throw new RuntimeException(lEx);
		}
	}

	/**
	 * {@inheritDoc }
	 */
	@Override
	public void notifyEvent(final String aEventName, final Object[] aArgs) {
		mLog.debug("Notifying '" + aEventName + "' event in '" + getName() + "' js app...");
		Settings lSettings = (Settings) JWebSocketBeanFactory.getInstance(ScriptingPlugIn.NS)
				.getBean("org.jwebsocket.plugins.scripting.settings");

		// notifying event into security sandbox
		Tools.doPrivileged(lSettings.getAppPermissions(getName(), getPath()),
				new PrivilegedAction<Object>() {
					@Override
					public Object run() {
						try {
							// notifying event
							((Invocable) getScriptApp()).invokeMethod(mApp, "notifyEvent", new Object[]{aEventName, aArgs});
							return true;
						} catch (Exception lEx) {
							if (BaseScriptApp.EVENT_FILTER_IN.equals(aEventName)) {
								if (mLog.isDebugEnabled()) {
									mLog.debug(Logging.getSimpleExceptionMessage(lEx, "notifying '" + aEventName + "' event"));
								}
								throw new RuntimeException(lEx.getMessage());
							} else {
								mLog.error(Logging.getSimpleExceptionMessage(lEx, "notifying '" + aEventName + "' event"));
								return false;
							}
						}
					}
				});
	}

	@Override
	public String getScriptLanguageExt() {
		return "js";
	}

	/**
	 * {@inheritDoc }
	 */
	@Override
	public Object callMethod(final String aObjectId, final String aMethod, final Object[] aArgs) throws Exception {
		final Invocable lInvocable = (Invocable) getScriptApp();
		Boolean lExists = (Boolean) lInvocable.invokeMethod(mApp, "isPublished", new Object[]{aObjectId});
		Assert.isTrue(lExists, "The object with id ' " + aObjectId + "' is not published!");

		final Object lObject = lInvocable.invokeMethod(mApp, "getPublished", new Object[]{aObjectId});

		// getting scripting plugin settings
		Settings lSettings = (Settings) JWebSocketBeanFactory.getInstance(ScriptingPlugIn.NS)
				.getBean("org.jwebsocket.plugins.scripting.settings");

		// calling method into a security sandbox
		return Tools.doPrivileged(lSettings.getAppPermissions(getName(), getPath()),
				new PrivilegedAction<Object>() {
					@Override
					public Object run() {
						// invoking method
						try {
							return lInvocable.invokeMethod(lObject, aMethod, aArgs);
						} catch (Exception lEx) {
							throw new RuntimeException(lEx);
						}
					}
				});
	}

	/**
	 * {@inheritDoc }
	 */
	@Override
	public String getVersion() throws Exception {
		Invocable lInvocable = (Invocable) getScriptApp();
		String lVersion = (String) lInvocable.invokeMethod(mApp, "getVersion", new Object[0]);

		return lVersion;
	}

	/**
	 * {@inheritDoc }
	 */
	@Override
	public String getDescription() throws Exception {
		Invocable lInvocable = (Invocable) getScriptApp();
		String lVersion = (String) lInvocable.invokeMethod(mApp, "getDescription", new Object[0]);

		return lVersion;
	}
}
