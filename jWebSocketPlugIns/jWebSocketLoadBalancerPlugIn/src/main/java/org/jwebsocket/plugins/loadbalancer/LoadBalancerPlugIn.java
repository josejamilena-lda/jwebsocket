//	---------------------------------------------------------------------------
//	jWebSocket Load Balancer Plug-in (Community Edition, CE)
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

import java.util.*;
import javolution.util.FastList;
import javolution.util.FastMap;
import org.apache.log4j.Logger;
import org.jwebsocket.api.PluginConfiguration;
import org.jwebsocket.api.WebSocketConnector;
import org.jwebsocket.config.JWebSocketCommonConstants;
import org.jwebsocket.config.JWebSocketServerConstants;
import org.jwebsocket.kit.CloseReason;
import org.jwebsocket.kit.PlugInResponse;
import org.jwebsocket.logging.Logging;
import org.jwebsocket.plugins.TokenPlugIn;
import org.jwebsocket.server.TokenServer;
import org.jwebsocket.token.Token;
import org.jwebsocket.util.Tools;
import org.springframework.context.ApplicationContext;

/**
 *
 * @author aschulze
 * @author rbetancourt
 */
public class LoadBalancerPlugIn extends TokenPlugIn {

	private static Logger mLog = Logging.getLogger();
	/**
	 *
	 */
	public static final String NS_LOADBALANCER = JWebSocketServerConstants.NS_BASE + ".plugins.loadbalancer";
	private final static String VERSION = "1.0.0";
	private final static String VENDOR = JWebSocketCommonConstants.VENDOR_CE;
	private final static String LABEL = "jWebSocket LoadBalancerPlugIn";
	private final static String COPYRIGHT = JWebSocketCommonConstants.COPYRIGHT_CE;
	private final static String LICENSE = JWebSocketCommonConstants.LICENSE_CE;
	private final static String DESCRIPTION = "jWebSocket Load Balancer Plug-in - Community Edition";
	/**
	 *
	 */
	protected ApplicationContext mBeanFactory;
	/**
	 *
	 */
	protected Settings mSettings;
	/**
	 *
	 */
	protected Map<String, Cluster> mClusters;
	/**
	 *
	 */
	protected long mShutdownTimeout;
	/**
	 *
	 */
	protected long mMessageTimeout;
	/**
	 *
	 */
	protected Map<String, TimerTask> mProcessMessage;

	/**
	 *
	 * @param aConfiguration
	 * @throws Exception
	 */
	public LoadBalancerPlugIn(PluginConfiguration aConfiguration) throws Exception {
		super(aConfiguration);
		if (mLog.isDebugEnabled()) {
			mLog.debug("Instantiating Load Balancer plug-in...");
		}
		// specify default name space for load balancer plugin
		this.setNamespace(NS_LOADBALANCER);

		try {
			mBeanFactory = getConfigBeanFactory();
			if (null == mBeanFactory) {
				mLog.error("No or invalid spring configuration for load "
					+ "balancer plug-in, some features may not be available.");
			} else {
				mSettings = (Settings) mBeanFactory.getBean("org.jwebsocket.plugins.loadbalancer.settings");
				if (null != mSettings) {
					mClusters = mSettings.getClusters();
					mShutdownTimeout = mSettings.getShutdownTimeout();
					mMessageTimeout = mSettings.getMessageTimeout();
					mProcessMessage = new FastMap<String, TimerTask>();
					if (mLog.isInfoEnabled()) {
						mLog.info("Load balancer plug-in successfully instantiated.");
					}
				} else {
					mLog.error("Don't was loaded settings correctly");
				}
			}
		} catch (Exception lEx) {
			mLog.error(Logging.getSimpleExceptionMessage(lEx,
				"instantiating load balancer plug-in"));
			throw lEx;
		}
	}

	@Override
	public String getVersion() {
		return VERSION;
	}

	@Override
	public String getLabel() {
		return LABEL;
	}

	@Override
	public String getDescription() {
		return DESCRIPTION;
	}

	@Override
	public String getVendor() {
		return VENDOR;
	}

	@Override
	public String getCopyright() {
		return COPYRIGHT;
	}

	@Override
	public String getLicense() {
		return LICENSE;
	}

	@Override
	public String getNamespace() {
		return NS_LOADBALANCER;
	}

	@Override
	public void processToken(PlugInResponse aResponse, WebSocketConnector aConnector, Token aToken) {
		String lType = aToken.getType();
		String lNS = aToken.getNS();

		if (lType != null && lNS != null) {
			if (lType.equals("getClusterEndPointsInfo")) {
				getClusterEndPointsInfo(aConnector, aToken);
			} else if (lType.equals("getStickyRoutes")) {
				getStickyRoutes(aConnector, aToken);
			} else if (lType.equals("registerServiceEndPoint")) {
				registerServiceEndPoint(aConnector, aToken);
			} else if (lType.equals("deregisterServiceEndPoint")) {
				deregisterServiceEndPoint(aConnector, aToken);
			} else if (lType.equals("shutdownEndpoint")) {
				shutdownEndPoint(aConnector, aToken);
			} else if (lType.equals("response")) {
				responseToClient(aToken);
			} else {
				sendToService(aConnector, aToken);
			}
		}
	}

	@Override
	public void connectorStopped(WebSocketConnector aConnector, CloseReason aCloseReason) {
		for (Map.Entry<String, Cluster> lEntry : mClusters.entrySet()) {
			Cluster lCluster = lEntry.getValue();
			String lServiceId = "myService_" + aConnector.getId();
			int lServicePosition = lCluster.getPosition(lServiceId);
			if (lServicePosition != -1) {
				lCluster.removeEndPoint(lServicePosition);
				String lMsg = "The service " + lServiceId + " in the cluster "
					+ lEntry.getKey() + " was disconnected by the " + aCloseReason;
				if (mLog.isDebugEnabled()) {
					mLog.debug(lMsg);
				}
				//TODO
				//Send notification
				//return;
			}
		}
	}

	@Override
	public Token invoke(WebSocketConnector aConnector, Token aToken) {
		String lType = aToken.getType();
		String lNS = aToken.getNS();

		if (lType != null && getNamespace().equals(lNS)) {
		}

		return null;
	}

	private void getClusterEndPointsInfo(WebSocketConnector aConnector, Token aToken) {
		List<Map<String, Object>> lInfo = new FastList<Map<String, Object>>();
		for (Map.Entry<String, Cluster> lEntry : mClusters.entrySet()) {
			Cluster lCluster = lEntry.getValue();
			Map<String, Object> lInfoCluster = new FastMap<String, Object>();
			lInfoCluster.put("clusterAlias", lEntry.getKey());
			lInfoCluster.put("clusterNS", lCluster.getNamespace());
			lInfoCluster.put("epCount", lCluster.getEndpoints().size());
			//lInfoCluster.put("endpoints", lCluster.getEndpoints());
			lInfoCluster.put("epStatus", lCluster.getEndPointsStatus());
			lInfoCluster.put("epId", lCluster.getEndPointsId());
			lInfoCluster.put("epRequests", lCluster.getEndPointsRequests());
			lInfo.add(lInfoCluster);
		}
		TokenServer lServer = getServer();
		Token lResponse = createResponse(aToken);
		lResponse.setList("info", lInfo);
		lServer.sendToken(aConnector, lResponse);
	}

	private void getStickyRoutes(WebSocketConnector aConnector, Token aToken) {
		List<Map<String, String>> lStickyRoutes = new FastList<Map<String, String>>();
		for (Map.Entry<String, Cluster> lEntry : mClusters.entrySet()) {
			List<String> lIDs = lEntry.getValue().getStickyId();
			for (int lPos = 0; lPos < lIDs.size(); lPos++) {
				Map<String, String> lInfoCluster = new FastMap<String, String>();
				lInfoCluster.put("clusterAlias", lEntry.getKey());
				lInfoCluster.put("epId", lIDs.get(lPos));
				lStickyRoutes.add(lInfoCluster);
			}
		}
		TokenServer lServer = getServer();
		Token lResponse = createResponse(aToken);
		lResponse.setList("routes", lStickyRoutes);
		lServer.sendToken(aConnector, lResponse);
	}

	private void registerServiceEndPoint(WebSocketConnector aConnector, Token aToken) {
		String lClusterAlias = aToken.getString("clusterAlias");
		String lMsg = null;
		int lCode = -1;
		TokenServer lServer = getServer();
		
		if (!hasAuthority(aConnector, NS_LOADBALANCER + ".registerServiceEndPoint")) {
			//lServer.sendToken(aConnector, lServer.createAccessDenied(aToken));
			//return;
		}

		if (getCluster(lClusterAlias) != null) {
			if (getCluster(lClusterAlias).addEndPoints(aConnector)) {
				lCode = 0;
				lMsg = "New service endpoint with ID: myService_" + aConnector.getId()
					+ ", was create successfully in the cluster " + lClusterAlias;
			} else {
				lMsg = "The service endpoint with ID: myService_" + aConnector.getId()
					+ ", already exist in the cluster";
			}
		} else {
			lMsg = "The cluster " + lClusterAlias + " don't exist";
		}

		Token lResponse = createResponse(aToken);
		lResponse.setInteger("code", lCode);
		lResponse.setString("msg", lMsg);
		lServer.sendToken(aConnector, lResponse);
	}

	private void deregisterServiceEndPoint(WebSocketConnector aConnector, Token aToken) {
		
		String lEndPointId = aToken.getString("epId");
		String lClusterAlias = aToken.getString("clusterAlias");
		String lMsg = "null";
		int lCode = -1;
		TokenServer lServer = getServer();

		if (!hasAuthority(aConnector, NS_LOADBALANCER + ".deregisterServiceEndPoint")) {
			//lServer.sendToken(aConnector, lServer.createAccessDenied(aToken));
			//return;
		}

		if (null != lEndPointId && null != lClusterAlias) {
			Cluster lCluster = getCluster(lClusterAlias);
			int lEndpointPosition = lCluster.getPosition(lEndPointId);
			if (lEndpointPosition != -1) {

				if (lCluster.removeEndPoint(lEndpointPosition)) {
					lCode = 0;
					lMsg = "The endpoint with ID: " + lEndPointId
						+ " was removed from the cluster " + lClusterAlias + " successfully";
				}
			}
		} else {
			lMsg = "The given endpoint id does not exists on target cluster!";
		}

		Token lResponse = createResponse(aToken);
		lResponse.setInteger("code", lCode);
		lResponse.setString("msg", lMsg);
		lServer.sendToken(aConnector, lResponse);
	}

	private void shutdownEndPoint(WebSocketConnector aConnector, Token aToken) {
		
		String lEndPointId = aToken.getString("epId");
		String lClusterAlias = aToken.getString("clusterAlias");
		TokenServer lServer = getServer();

		if (!hasAuthority(aConnector, NS_LOADBALANCER + ".shutdownEndPoint")) {
			//lServer.sendToken(aConnector, lServer.createAccessDenied(aToken));
			//return;
		}

		if (null != lEndPointId && null != lClusterAlias) {
			aToken.setNS(getCluster(lClusterAlias).getNamespace());
			aToken.setType("shutdown");
			
			System.out.println("mi token pa shutdown *** "+aToken);
			
			lServer.sendToken(getSourceConnector(lEndPointId.split("_")[1]), aToken);

			final WebSocketConnector lConnector = aConnector;
			final Token lToken = aToken;
			Tools.getTimer().schedule(new TimerTask() {
				@Override
				public void run() {
					if (getCluster(lToken.getString("clusterAlias")).endPointExists(lToken.getString("epId"))) {
						deregisterServiceEndPoint(lConnector, lToken);
					}
				}
			}, mShutdownTimeout);
		} else {
			Token lResponse = createResponse(aToken);
			lResponse.setString("msg", "The endpoint ID or cluster alias has invalid value!");
			lResponse.setInteger("code", -1);
			lServer.sendToken(aConnector, lResponse);
		}
	}

	private void sendToService(WebSocketConnector aConnector, Token aToken) {
		aToken.setString("sourceId", aConnector.getId());
		String lNS = aToken.getNS();
		String lConnectorId = aConnector.getId();
		TokenServer lServer = getServer();
		ClusterEndPoint lEndPoint = getOptimumServiceEndPoint(lNS);
		if (null != lEndPoint) {
			lEndPoint.increaseRequests();
			lServer.sendToken(lEndPoint.getConnector(), aToken);

			final WebSocketConnector lConnector = aConnector;
			final Token lToken = aToken;
			TimerTask lMessageTimeout = new TimerTask() {

				@Override
				public void run() {
					sendToService(lConnector, lToken);
				}
			};
			Tools.getTimer().schedule(lMessageTimeout, mMessageTimeout);

			try {
				mProcessMessage.put(lConnectorId, lMessageTimeout);
			} catch (Exception lEx) {
				mProcessMessage.remove(lConnectorId).cancel();
				mProcessMessage.put(lConnectorId, lMessageTimeout);
			}
		} else {
			String lMsg = "No service available on namespace: " + lNS;
			Token lResponse = createResponse(aToken);
			lResponse.setInteger("code", -1);
			lResponse.setString("msg", lMsg);
			lServer.sendToken(aConnector, lResponse);
		}
	}

	private void responseToClient(Token aToken) {
		String lSourceId = aToken.getString("sourceId");
		mProcessMessage.remove(lSourceId).cancel();
		getServer().sendToken(getSourceConnector(lSourceId), aToken);
	}

	private ClusterEndPoint getOptimumServiceEndPoint(String aNamespace) {
		for (Map.Entry<String, Cluster> lEntry : mClusters.entrySet()) {
			Cluster lValue = lEntry.getValue();
			if (lValue.getNamespace().equals(aNamespace)) {
				return lValue.getOptimumEndPoint();
			}
		}
		return null;
	}

	private Cluster getCluster(String aAlias) {
		return mClusters.get(aAlias);
	}

	private WebSocketConnector getSourceConnector(String aSourceId) {
		return getServer().getConnector(aSourceId);
	}

	public boolean supportsNamespace(String aNamespace) {
		for (Map.Entry<String, Cluster> lEntry : mClusters.entrySet()) {
			if (lEntry.getValue().getNamespace().equals(aNamespace)) {
				return true;
			}
		}
		return false;
	}
}
