Ext.Loader.setConfig({
	enabled: true,
	// Don't set to true, it's easier to use the debugger option to disable caching
	disableCaching: false,
	paths: {
		'Ext.jws': '../../res/js/jWebSocketSenchaPlugIn/'
	}
});

Ext.require([
	'Ext.data.*',
	'Ext.grid.*',
	'Ext.form.*',
	'Ext.tip.QuickTipManager',
	'Ext.jws.Client',
	'Ext.jws.data.Proxy',
	'Ext.jws.form.Panel',
	'Ext.jws.form.action.Load',
	'Ext.jws.form.action.Submit'
]);

Ext.ns("ST");

ST.NS = "stockticker";
ST.TT_RECORDS = "records";

Ext.onReady(function () {
	Ext.jwsClient.open();

	Ext.jwsClient.on('OnOpen', function () {
		init();
	});

	Ext.jwsClient.on('OnClose', function () {
		Ext.Msg.alert("Stockticker not Connected", "Sorry, but there is no connection with jWebSocket Server.");
	});
});

function init() {
	var lLoginWindow = getWinLog();
	lLoginWindow.show();
}

function pctChange(aVal) {
	if (aVal > 0) {
		return '<span style="color:green;">' + aVal + '%</span>';
	} else if (aVal < 0) {
		return '<span style="color:red;">' + aVal + '%</span>';
	}
	return aVal;
}
function pctTrend(aVal) {
	if (aVal === 1) {
		return "<img src='css/images/arrow-red.gif'>";
	} else if (aVal === 0) {
		return "<img src='css/images/arrow-green.gif'>";
	}
	return "<img src='css/images/arrow-black.gif'>";

}
function pctRn(val) {
	return val.toFixed(2);
}
// model of tiker
Ext.define('ModelTicker', {
	extend: 'Ext.data.Model',
	fields: ['id', 'name', 'bid', 'price', 'ask', 'chng', 'trend']
});
// model of History
Ext.define('ModelHistory', {
	extend: 'Ext.data.Model',
	fields: ['price']
});
// model of Buy
Ext.define('ModelBuy', {
	extend: 'Ext.data.Model',
	fields: ['user', 'name', 'cant', 'inversion', 'value']
});
Ext.define('ModelChart', {
	extend: 'Ext.data.Model',
	fields: ['name']
});
Ext.define('ModelComb', {
	extend: 'Ext.data.Model',
	fields: ['name']
});

var GLOBAL_USER = "user";
//var GLOBAL_NAME_CHART="";

var GLOBAL_STK_USER_CHART = {
	users: [],
	addUsers: function (user) {
		if (this.users.indexOf(user) === -1) {
			this.users.push(user);
		}
	},
	deleteUser: function (user) {
		var pos = this.users.indexOf(user);
		if (pos !== -1) {
			this.users[pos] = null;
		}
	},
	findUser: function (user) {
		var pos = this.users.indexOf(user);
		if (pos !== -1) {
			return true;
		}
		return false;
	}
};

function getWinLog() {
	var lLogWindow = Ext.create('Ext.window.Window', {
		width: 754,
		height: 500,
		x: 20,
		y: 20,
		id: 'winlog',
		resizable: false,
		closable: false,
		draggable: false,
		maximizable: false,
		minimizable: false,
		border: false,
		frame: true,
		bodyStyle: 'background:#eaf4dc;',
		items: [{
				xtype: 'jwsFormPanel',
				jwsSubmit: true,
				id: 'formLogin',
				width: 754,
				height: 48,
				x: 0,
				y: 0,
				layout: 'absolute',
				bodyStyle: 'background:transparent url(css/images/banner.png) no-repeat;',
				defaultType: 'textfield',
				frame: false,
				border: false,
				items: [{
						id: 'txUserlogin',
						vtype: "alphanum",
						name: 'user',
						width: 124,
						height: 25,
						x: 402,
						y: 10,
						emptyText: 'User',
						allowBlank: false,
						minLength: 2
					}, {
						id: 'txPasslogin',
						name: 'pass',
						width: 124,
						height: 25,
						x: 531,
						y: 10,
						allowBlank: false,
						inputType: 'password',
						emptyText: 'Password',
						listeners: {
							specialkey: function (aField, aEvent) {
								if (aEvent.getKey() === aEvent.ENTER) {
									Ext.getCmp('buttonLogin').handler();
								}
							}
						}
					}, {
						id: "buttonLogin",
						xtype: 'button',
						cls: 'login',
						width: 82,
						height: 25,
						x: 660,
						y: 10,
						tooltip: 'Login',
						handler: function () {
							var lForm = this.up('form');
							GLOBAL_USER = Ext.getCmp('txUserlogin').value;

							var lAction = {
								ns: ST.NS,
								tokentype: ST.NS + '.login',
								failure: function (aForm, aAction) {
									aForm.reset();
									Ext.Msg.alert("Information", "The user does not exist");
								},
								success: function (aForm, aAction) {
									aForm.reset();
									lLogWindow.close();
									var lTickerWindow = getWinTicker();
									lTickerWindow.show();
									var lPlugIn = {
										processToken: function (aToken) {
											if (aToken.ns === ST.NS && aToken.type === ST.TT_RECORDS) {
												Ext.getStore("storeTicker").loadData(aToken.data);
											}
										}
									};
									Ext.jwsClient.addPlugIn(lPlugIn);
								}
							};
							if (lForm.getForm().isValid()) {
								lForm.submit(lAction);
							} else {
								Ext.Msg.alert("Information", "Please you have errors in the form");
							}
						}

					}]
			}, {
				xtype: 'jwsFormPanel',
				jwsSubmit: true,
				id: 'formRegister',
				width: 754,
				height: 330,
				x: 0,
				y: 120,
				layout: 'absolute',
				bodyStyle: 'background:#eaf4dc;',
				defaultType: 'textfield',
				border: false,
				frame: false,
				items: [{
						id: 'txUser',
						name: 'user',
						width: 124,
						height: 25,
						x: 315,
						y: 35,
						allowBlank: false,
						emptyText: 'User',
						vtype: 'alphanum',
						minLength: 2
					}, {
						id: 'txPass',
						name: 'pass',
						width: 124,
						height: 25,
						x: 315,
						y: 73,
						allowBlank: false,
						inputType: 'password',
						emptyText: 'Password'
					}, {
						id: 'txRepPass',
						width: 124,
						height: 25,
						x: 315,
						y: 111,
						allowBlank: false,
						inputType: 'password',
						emptyText: 'Repeat Password',
						listeners: {
							specialkey: function (field, e) {
								if (e.getKey() === e.ENTER) {
									Ext.getCmp('buttonRegister').handler();
								}
							}
						}
					}, {
						id: "buttonRegister",
						xtype: 'button',
						cls: 'register',
						width: 82,
						height: 25,
						x: 336,
						y: 148,
						tooltip: 'Register',
						handler: function () {
							var lForm = this.up('form');
							var lAction = {
								ns: ST.NS,
								tokentype: ST.NS + '.create',
								success: function () {
									Ext.Msg.alert("Information", "User successfully created");
									lForm.reset();
								},
								failure: function () {
									Ext.Msg.alert("Information", "The user already exists");
									lForm.reset();
								}
							};
							if (Ext.getCmp('txPass').value === Ext.getCmp('txRepPass').value) {
								if (lForm.getForm().isValid()) {
									lForm.submit(lAction);
								} else {
									Ext.Msg.alert("Information", "Please check the input data, you have errors in the form");
								}
							} else {
								lForm.getForm().reset();
								Ext.Msg.alert("Information", "Passwords doesn't match");
							}
						}
					}]
			}]
	});
	return lLogWindow;
}

function getWinTicker() {
	//chart
	var proxy_comb_chart = {
		ns: ST.NS,
		api: {
			read: ST.NS + '.combobox'
		},
		reader: {
			root: 'data',
			totalProperty: 'totalCount'
		}
	};
	var jWSProxyCombChart = new Ext.jwsClient.data.proxy(proxy_comb_chart);
	var storeCombChart = new Ext.data.Store({
		autoSync: true,
		id: 'storeCombChart',
		autoLoad: true,
		pageSize: 10,
		model: 'ModelComb',
		proxy: jWSProxyCombChart
	});

	//ticker
	var proxy_ticker = {
		ns: ST.NS,
		api: {
			read: ST.NS + '.gettickets'
		},
		reader: {
			root: 'data',
			totalProperty: 'totalCount'
		}
	};
	var jWSProxyTicker = new Ext.jwsClient.data.proxy(proxy_ticker);
	var storeTicker = new Ext.data.Store({
		autoSync: true,
		id: "storeTicker",
		autoLoad: true,
		pageSize: 10,
		model: 'ModelTicker',
		proxy: jWSProxyTicker
	});

	// Buy
	var proxy_buy = {
		ns: ST.NS,
		api: {
			read: ST.NS + '.readBuy'
		},
		reader: {
			root: 'data',
			totalProperty: 'totalCount'
		}
	};
	var jWSProxyBuy = new Ext.jwsClient.data.proxy(proxy_buy);
	var storeBuy = new Ext.data.Store({
		id: 'storeBuy',
		autoLoad: true,
		pageSize: 10,
		model: 'ModelBuy',
		proxy: jWSProxyBuy
	});
	var proxy_chart = {
		ns: ST.NS,
		api: {
			read: ST.NS + '.chart'
		},
		reader: {
			root: 'data'//,
		}
	};
	var jWSProxyChart = new Ext.jwsClient.data.proxy(proxy_chart);
	var storechart = new Ext.data.Store({
		id: "storechart",
		clearOnPageLoad: true,
		pageSize: 10,
		model: 'ModelChart',
		proxy: jWSProxyChart
	});

	var lwinTicker = Ext.create('Ext.window.Window', {
		width: 754,
		height: 765,
		x: 20,
		y: 20,
		id: 'winticker',
		resizable: false,
		closable: false,
		draggable: false,
		maximizable: false,
		minimizable: false,
		border: false,
		frame: true,
		bodyStyle: 'background:#eaf4dc;',
		items: [{
				xtype: 'panel',
				id: 'panellogout',
				frame: false,
				border: false,
				width: 754,
				height: 46,
				x: 0,
				y: 0,
				layout: 'absolute',
				bodyStyle: 'background:transparent url(\n\
                      css/images/banner.png)no-repeat;',
				items: [{
						xtype: 'label',
						cls: 'textuser',
						text: GLOBAL_USER,
						x: 602,
						y: 15
					}, {
						xtype: 'button',
						cls: 'logout',
						width: 82,
						height: 29,
						x: 662,
						y: 10,
						border: false,
						frame: false,
						tooltip: 'Logout',
						handler: function () {
							GLOBAL_STK_USER_CHART.deleteUser(GLOBAL_USER);
							Ext.jwsClient.send(ST.NS, ST.NS + ".logout", {
							}, {
								success: function () {
									var lwinlog = Ext.getCmp("winlog");
									if (typeof lwinlog !== "undefined") {
										lwinlog.close();
									}
									var llog = getWinLog();
									llog.show();
									lwinTicker.close();
									var winSell = Ext.getCmp("winSell");
									if (typeof winSell !== "undefined") {
										winSell.close();
									}
								},
								failure: function () {
									Ext.Msg.alert("Information", "Please you have errors");
								}
							});
						}
					}]
			}, {
				xtype: 'panel',
				id: 'panel',
				frame: false,
				border: false,
				width: 470,
				height: 46,
				x: 10,
				y: 26,
				layout: 'absolute',
				bodyStyle: 'background:#eaf4dc;',
				items: [
					{
						cls: 'text',
						bodyStyle: 'background:#eaf4dc;',
						border: false,
						html: 'This Demo allows to display a real time \n\
                      Stock Tiker as well as statistical data,\n\
                      providing the user facilities \n\
                      to handle deposits and instruments.'
					}]
			}, {
				xtype: 'grid',
				store: storeTicker,
				id: 'gridticker',
				title: 'Provider Information of Ticker',
				frame: true,
				border: true,
				width: 480,
				height: 302,
				x: 5,
				y: 35,
				columnLines: true,
				layout: 'absolute',
				bbar: [{
						text: 'Buy Stock',
						icon: 'css/images/drop-yes.gif',
						handler: function () {
							var winBuy = Ext.getCmp("winbuy");
							if (typeof winBuy !== "undefined")
								winBuy.close();
							var buy = getWinBuy();
							buy.show();
						}
					}],
				columns: [{
						header: 'Id',
						dataIndex: 'id',
						width: 100,
						hidden: true,
						sortable: true,
						hideable: true
					}, {
						header: 'Instrument Name',
						dataIndex: 'name',
						width: 100,
						sortable: true,
						hideable: true
					}, {
						header: 'BID',
						dataIndex: 'bid',
						align: 'center',
						sortable: true,
						hideable: true,
						flex: 1
					}, {
						header: 'Price',
						dataIndex: 'price',
						align: 'center',
						sortable: true,
						hideable: true,
						flex: 1
					}, {
						header: 'ASK',
						dataIndex: 'ask',
						align: 'center',
						sortable: true,
						hideable: true,
						flex: 1
					}, {
						header: '% Change',
						dataIndex: 'chng',
						renderer: pctChange,
						align: 'center',
						sortable: true,
						hideable: true,
						flex: 1
					}, {
						header: 'Trend',
						dataIndex: 'trend',
						sortable: true,
						hideable: true,
						renderer: pctTrend,
						align: 'center',
						flex: 1
					}],
				listeners: {
					itemdblclick: function (aView, aRecord) {
						var lWindowHistory = Ext.getCmp("winHistory");
						if (typeof lWindowHistory !== "undefined") {
							lWindowHistory.close();
						}
						lWindowHistory = getWinHistory();
						lWindowHistory.title = 'History of ' + aRecord.data.name;
						var lRecName = aRecord.data.name;
						lWindowHistory.show();
						var lPlugIn = {
							processToken: function (aToken) {
								if (aToken.ns === ST.NS && aToken.type === ST.TT_RECORDS) {
									var lData, lIdx, lDataObj = {},
											lPrice = null;
									for (lIdx = 0; lIdx < aToken.data.length; lIdx++) {
										if (aToken.data[lIdx].data.name === lRecName) {
											lData = aToken.data[lIdx].data.histoy;
										}
									}
									lDataObj.data = [];
									for (var lIdx1 = 0; lIdx1 < lData.length; lIdx1++) {
										lPrice = new ModelHistory({
											price: lData[lIdx1]
										});
										lDataObj.data.push(lPrice);
									}
									Ext.getStore("storeHistory").loadData(lDataObj.data);
								}
							}
						};
						Ext.jwsClient.addPlugIn(lPlugIn);
					}
				}
			}, {
				xtype: 'tabpanel',
				id: 'tabPurchasingManagement',
				title: 'Personal Depot',
				frame: true,
				border: true,
				width: 480,
				height: 322,
				hideMode: 'visibility',
				x: 5,
				y: 42,
				columnLines: true,
				activeTab: 1,
				layout: 'absolute',
				items: [
					{
						xtype: 'panel',
						title: 'Chart',
						id: 'panelChart',
						frame: false,
						border: false,
						width: 470,
						height: 210,
						bbar: ['->', {
								xtype: 'combobox',
								id: 'ComboChart',
								name: "name",
								dataIndex: 'name',
								fieldLabel: 'Instrument Name',
								store: storeCombChart,
								queryMode: 'local',
								displayField: 'name',
								editable: false,
								anchor: '97%',
								x: 5,
								y: 10,
								emptyText: 'Name',
								allowBlank: false,
								msgTarget: 'side',
								listeners: {
									focus: {
										fn: function () {
											Ext.jwsClient.send(ST.NS, ST.NS + ".combobox", {}, {
												success: function (aToken) {
													var data = aToken.data;
													var dataArray = {};
													dataArray.data = [];
													var name = null;
													for (var i = 0; i < data.length; i++) {
														name = new ModelComb({
															name: data[i]
														});
														dataArray.data.push(name);
													}
													Ext.getStore("storeCombChart").loadData(dataArray.data);
												}
											});
										}
									},
									select: {
										fn: function () {
											GLOBAL_STK_USER_CHART.addUsers(GLOBAL_USER);
											var GLOBAL_NAME_CHART = Ext.getCmp('ComboChart').getValue();

											var lcant;
											Ext.jwsClient.send(ST.NS, ST.NS + ".chart", {
												namechart: GLOBAL_NAME_CHART
											}, {
												success: function (aToken) {
													lcant = aToken.data;
												},
												failure: function (aToken) {
													Ext.Msg.alert("Information", "Please you have errors");
												}
											});
											var lPlugIn1 = {
												processToken: function (aToken) {
													if (!GLOBAL_STK_USER_CHART.findUser(GLOBAL_USER))
														return;
													if (aToken.ns === ST.NS && aToken.type === ST.TT_RECORDS) {
														var lData;
														for (i = 0; i < aToken.data.length; i++) {
															if (aToken.data[i].data.name === GLOBAL_NAME_CHART)
																lData = aToken.data[i].data.histoy;
														}
														var lDataToShow = new Array();
														for (var i = 0; i < lData.length; i++) {
															lDataToShow.push({
																name: 'secs' + i,
																data: parseInt(lData[i] * lcant)
															});
														}
														Ext.getStore("storechart").loadData(lDataToShow);
													}
												}
											};
											Ext.jwsClient.addPlugIn(lPlugIn1);
										}
									}
								}
							}],
						items: [
							{
								xtype: 'chart',
								id: 'chartdepot',
								width: 470,
								height: 210,
								store: storechart,
								insetPadding: 30,
								axes: [{
										type: 'Numeric',
										minimum: 0,
										position: 'left',
										fields: ['data'],
										title: false,
										grid: true,
										label: {
											renderer: Ext.util.Format.numberRenderer('0,0'),
											font: '10px Arial'
										}
									}, {
										type: 'Category',
										position: 'bottom',
										fields: ['name'],
										title: false,
										label: {
											font: '11px Arial'
										}
									}
								],
								series: [{
										type: 'line',
										axis: 'left',
										xField: 'name',
										yField: 'data',
										tips: {
											trackMouse: true,
											width: 80,
											height: 40,
											renderer: function (storeItem, item) {
												this.setTitle(storeItem.get('name') + '<br />' + storeItem.get('data'));
											}
										},
										style: {
											fill: '#38B8BF',
											stroke: '#38B8BF',
											'stroke-width': 3
										},
										markerConfig: {
											type: 'circle',
											size: 4,
											radius: 4,
											'stroke-width': 0,
											fill: '#38B8BF',
											stroke: '#38B8BF'
										}
									}]
							}
						]
					},
					{
						xtype: 'grid',
						store: storeBuy,
						id: 'gridtpurchases',
						title: 'Depot',
						frame: true,
						border: true,
						width: 470,
						height: 210,
						layout: 'absolute',
						columnLines: true,
						bbar: [{
								text: 'Sell Stock',
								icon: 'css/images/sell.png',
								handler: function () {
									var lSellWindow = Ext.getCmp("winSell");
									if (typeof lSellWindow !== "undefined") {
										lSellWindow.close();
									}
									lSellWindow = getWinSell();
									if (lSellWindow) {
										lSellWindow.show();
									}
								}
							}],
						columns: [
							{
								header: 'Instrument Name',
								dataIndex: 'name',
								width: 100,
								sortable: true,
								hideable: true,
								flex: 1
							}, {
								header: 'Amount Stocks',
								dataIndex: 'cant',
								sortable: true,
								hideable: true,
								align: 'center',
								flex: 1
							}, {
								header: 'Inversion',
								dataIndex: 'inversion',
								sortable: true,
								hideable: true,
								renderer: pctRn,
								align: 'center',
								flex: 1
							}, {
								header: 'Value',
								dataIndex: 'value',
								sortable: true,
								hideable: true,
								renderer: pctRn,
								align: 'center',
								flex: 1
							}]
					}
				]
			}
		]
	});
	return lwinTicker;
}

function getWinBuy() {
	var storeName = Ext.create('Ext.data.Store', {
		fields: ['abbr', 'name'],
		data: [
			{
				"name": "IBM"
			},
			{
				"name": "Google"
			},
			{
				"name": "Microsoft"
			},
			{
				"name": "Intel"
			},
			{
				"name": "Oracle"
			},
			{
				"name": "Apple"
			},
			{
				"name": "NVIDEA"
			},
			{
				"name": "Sony"
			},
			{
				"name": "Samsung"
			},
			{
				"name": "Motorola"
			}]

	});
	var lwinBuy = Ext.create('Ext.window.Window', {
		width: 240,
		height: 150,
		x: 520,
		y: 148,
		id: 'winbuy',
		maximizable: false,
		minimizable: false,
		draggable: false,
		resizable: false,
		border: true,
		title: 'Instrument Buy',
		layout: "fit",
		items: [{
				xtype: 'form',
				jwsSubmit: true,
				id: 'formBuy',
				frame: false,
				border: false,
				width: 227,
				height: 115,
				layout: 'absolute',
				bodyStyle: 'background-color:#eaf4dc;',
				defaultType: 'textfield',
				items: [
					{
						xtype: 'combobox',
						id: 'Comboname',
						name: 'name',
						fieldLabel: 'Instrument Name',
						store: storeName,
						displayField: 'name',
						editable: false,
						anchor: '97%',
						x: 5,
						y: 10,
						emptyText: 'Name',
						allowBlank: false
					}, {
						xtype: 'numberfield',
						id: 'numbercant',
						anchor: '97%',
						name: 'cant',
						fieldLabel: 'Amount Stocks',
						value: 1,
						x: 5,
						y: 40,
						maxValue: 100,
						minValue: 0
					}, {
						xtype: 'button',
						text: 'Buy',
						name: 'Buy',
						width: 60,
						height: 25,
						x: 85,
						y: 70,
						tooltip: 'Buy',
						handler: function () {
							var lForm = this.up('form').getForm();
							var lAction = {
								ns: ST.NS,
								tokentype: ST.NS + '.buy',
								success: function (aForm, action) {
									Ext.getStore("storeBuy").load();
									aForm.reset();
								},
								failure: function (aForm, action) {
									aForm.reset();
									Ext.Msg.alert("Information", "Bad response to buy");
								}
							};
							if (lForm.isValid()) {
								lForm.submit(lAction);
							} else {
								Ext.Msg.alert("Information", "Please you have errors in the form");
							}
						}
					}, {
						xtype: 'button',
						text: 'Cancel',
						width: 60,
						height: 25,
						x: 150,
						y: 70,
						tooltip: 'Cancel',
						handler: function () {
							lwinBuy.close();

						}
					}]
			}]
	});
	return lwinBuy;
}

function getWinSell() {
	var proxy_comb = {
		ns: ST.NS,
		api: {
			read: ST.NS + '.combobox'
		},
		reader: {
			root: 'data',
			totalProperty: 'totalCount'
		}
	};
	var jWSProxyComb = new Ext.jwsClient.data.proxy(proxy_comb);
	var storeComb = new Ext.data.Store({
		autoSync: true,
		id: 'storeComb',
		pageSize: 10,
		model: 'ModelComb',
		proxy: jWSProxyComb
	});
	var lSellWindow = Ext.create('Ext.window.Window', {
		width: 240,
		height: 150,
		x: 520,
		y: 450,
		id: 'winSell',
		maximizable: false,
		minimizable: false,
		draggable: false,
		resizable: false,
		border: true,
		title: 'Instrument Sell',
		layout: "fit",
		items: [{
				xtype: 'form',
				jwsSubmit: true,
				id: 'formSell',
				frame: false,
				border: false,
				width: 227,
				height: 115,
				layout: 'absolute',
				bodyStyle: 'background:#eaf4dc;',
				defaultType: 'textfield',
				items: [{
						xtype: 'combobox',
						id: 'ComboSell',
						name: "name",
						dataIndex: 'name',
						fieldLabel: 'Instrument Name',
						store: storeComb,
						queryMode: 'local',
						editable: false,
						displayField: 'name',
						anchor: '97%',
						x: 5,
						y: 10,
						emptyText: 'Name',
						allowBlank: false,
						msgTarget: 'side',
						listeners: {
							focus: {
								fn: function () {
									Ext.jwsClient.send(ST.NS, ST.NS + ".combobox", {
									}, {
										success: function (aToken) {
											var data = aToken.data;
											var dataArray = {};
											dataArray.data = [];
											var name = null;
											for (var i = 0; i < data.length; i++) {
												name = new ModelComb({
													name: data[i]
												});
												dataArray.data.push(name);
											}
											Ext.getStore("storeComb").loadData(dataArray.data);
										},
										failure: function (aToken) {
											Ext.Msg.alert("Information", "Please you have errors in the form");
										}
									});
								}
							}
						}
					}, {
						xtype: 'numberfield',
						anchor: '97%',
						name: "cant",
						id: 'numbercant',
						fieldLabel: 'Amount Stocks',
						value: 1,
						x: 5,
						y: 40,
						maxValue: 100,
						minValue: 1
					}, {
						xtype: 'button',
						text: 'Sell',
						name: 'Sell',
						width: 60,
						height: 25,
						x: 85,
						y: 70,
						tooltip: 'Sell',
						handler: function () {
							var lForm = this.up('form').getForm();
							var action = {
								ns: ST.NS,
								tokentype: ST.NS + '.sell',
								success: function (aForm, action) {
									Ext.getStore("storeBuy").load();
									aForm.reset();
								},
								failure: function (aForm, action) {
									aForm.reset();
									Ext.Msg.alert("Information", "Bad response to sell");
								}
							};
							if (lForm.isValid()) {
								lForm.submit(action);
							} else {
								Ext.Msg.alert("Information", "Please you have errors in the form");
							}
						}
					}, {
						xtype: 'button',
						text: 'Cancel',
						width: 60,
						height: 25,
						x: 150,
						y: 70,
						tooltip: 'Cancel',
						handler: function () {
							lSellWindow.close();
						}
					}]
			}]
	});
	return lSellWindow;
}

function getWinHistory() {
	var jWSProxyHist = new Ext.jwsClient.data.proxy({
		ns: ST.NS,
		api: {
			read: ST.NS + '.gettickets'
		},
		reader: {
			root: 'data'
		}
	});
	var storeHistory = new Ext.data.Store({
		autoSync: true,
		autoLoad: true,
		pageSize: 10,
		id: 'storeHistory',
		model: 'ModelHistory',
		proxy: jWSProxyHist
	});
	var winHistory = Ext.create('Ext.window.Window', {
		width: 150,
		minWidth: 100,
		height: 275,
		x: 520,
		y: 148,
		id: 'winHistory',
		maximizable: false,
		minimizable: false,
		draggable: false,
		resizable: false,
		border: false,
		layout: "fit",
		items: [{
				xtype: 'grid',
				store: storeHistory,
				id: 'gridthistory',
				width: 90,
				height: 220,
				border: false,
				frame: true,
				layout: 'absolute',
				columns: [{
						header: 'Price',
						dataIndex: 'price',
						sortable: true,
						hideable: true,
						flex: 1
					}]
			}]
	});
	return winHistory;
}