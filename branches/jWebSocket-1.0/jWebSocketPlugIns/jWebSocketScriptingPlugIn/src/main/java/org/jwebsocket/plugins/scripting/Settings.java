//	---------------------------------------------------------------------------
//	jWebSocket - Settings for Scripting Plug-in (Community Edition, CE)
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
package org.jwebsocket.plugins.scripting;

import java.io.File;
import java.io.FileFilter;
import java.security.Permission;
import java.security.Permissions;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import javolution.util.FastMap;
import org.apache.commons.io.filefilter.FileFilterUtils;
import org.jwebsocket.util.Tools;
import org.springframework.util.Assert;

/**
 *
 * @author aschulze
 * @author kyberneees
 */
public class Settings {

	/**
	 * Applications directory path
	 */
	private File mAppsDirectory;
	/**
	 * Global security permissions
	 */
	private List<String> mGlobalSecurityPermissions = new LinkedList<String>();
	/**
	 * Applications security permissions
	 */
	private Map<String, List<String>> mAppsSecurityPermissions = new LinkedHashMap<String, List<String>>();
	/**
	 * Local apps permissions store for performance
	 */
	private Map<String, Permissions> mCachedPermissions = new FastMap<String, Permissions>().shared();

	/**
	 * Gets the map representation <app name, app absolute path> of the apps
	 * directory.
	 *
	 * @return
	 */
	public Map<String, String> getApps() {
		Map<String, String> lApps = new HashMap<String, String>();
		File[] lFiles = mAppsDirectory.listFiles((FileFilter) FileFilterUtils.directoryFileFilter());
		for (File lF : lFiles) {
			lApps.put(lF.getName(), lF.getAbsolutePath());
		}

		return lApps;
	}
	private String mAppsDirectoryPath;

	/**
	 * Gets the applications directory path.
	 *
	 * @return
	 */
	public String getAppsDirectory() {
		return mAppsDirectoryPath;
	}

	/**
	 * Sets the applications directory path.
	 *
	 * @param aAppsDirectoryPath
	 */
	public void setAppsDirectory(String aAppsDirectoryPath) {
		this.mAppsDirectoryPath = Tools.expandEnvVarsAndProps(aAppsDirectoryPath);
	}

	/**
	 * Initialize apps directory checkings.
	 *
	 * @throws Exception
	 */
	public void initialize() throws Exception {
		File lDirectory = new File(mAppsDirectoryPath);
		Assert.isTrue(lDirectory.isDirectory(), "The applications directory path does not exists!"
				+ " Please check directory path or access permissions.");
		Assert.isTrue(lDirectory.canWrite(), "The Scripting plug-in requires WRITE permissions in the applications directory!");

		mAppsDirectory = lDirectory;
	}

	/**
	 * Sets the global security permissions that apply to all script
	 * applications.
	 *
	 * @param aPermissions
	 */
	public void setGlobalSecurityPermissions(List<String> aPermissions) {
		if (null != aPermissions) {
			mGlobalSecurityPermissions.addAll(aPermissions);
		}
	}

	/**
	 * Gets the global security permissions.
	 *
	 * @return
	 */
	public List<String> getGlobalSecurityPermissions() {
		return mGlobalSecurityPermissions;
	}

	/**
	 * Sets apps security permissions. Global permissions are always considered.
	 *
	 * @param aPermissions
	 */
	public void setAppsSecurityPermissions(Map<String, List<String>> aPermissions) {
		if (null != aPermissions) {
			mAppsSecurityPermissions.putAll(aPermissions);
		}
	}

	/**
	 * Gets apps security permissions Map
	 *
	 * @return
	 */
	public Map<String, List<String>> getAppsSecurityPermissions() {
		return mAppsSecurityPermissions;
	}

	/**
	 * Gets application security permissions.
	 *
	 * @param aAppName
	 * @return
	 */
	public Permissions getAppPermissions(String aAppName) {
		if (mCachedPermissions.containsKey(aAppName)) {
			return mCachedPermissions.get(aAppName);
		}

		Permissions lPerms = new Permissions();
		Permission lPermission;
		Map<String, String> lAppsFolder = getApps();

		// processing global permissions
		for (String lStrPerm : getGlobalSecurityPermissions()) {
			lPermission = Tools.stringToPermission(Tools.expandEnvVarsAndProps(
					lStrPerm.replace("${APP_HOME}", lAppsFolder.get(aAppName))));

			if (null != lPermission) {
				lPerms.add(lPermission);
			}
		}

		// processing app permissions
		if (getAppsSecurityPermissions().containsKey(aAppName)) {
			for (String lStrPerm : getAppsSecurityPermissions().get(aAppName)) {
				lPermission = Tools.stringToPermission(Tools.expandEnvVarsAndProps(
						lStrPerm.replace("${APP_HOME}", lAppsFolder.get(aAppName))));

				if (null != lPermission) {
					lPerms.add(lPermission);
				}
			}
		}

		// caching permissions
		mCachedPermissions.put(aAppName, lPerms);

		return lPerms;
	}
}
