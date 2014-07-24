
var resetKiosk = {
	
	timer	: Components.classes["@mozilla.org/timer;1"]
						.createInstance(Components.interfaces.nsITimer), 

	prefManager : Components.classes["@mozilla.org/preferences-service;1"]
	                    .getService(Components.interfaces.nsIPrefBranch),
	
	init : function() {
		resetKiosk.timer.cancel();
		resetKiosk.timer.initWithCallback(resetKiosk.perform,
								resetKiosk.prefManager.getIntPref("extensions.resetKiosk.timeoutseconds")*1000, 
								Components.interfaces.nsITimer.TYPE_ONE_SHOT);
	},
	removeExtraTabs : function(homepage) {
		var tabs  = gBrowser.mTabContainer.childNodes;
		for (var index = tabs.length-1; index >=0 ; --index) {
			if(tabs[index] != homepage) {
				gBrowser.removeTab(tabs[index]);
			}
		}
	},
	reloadtab : function() {
		var tab = gBrowser.addTab(resetKiosk.prefManager.getCharPref("browser.startup.homepage"));
		resetKiosk.removeExtraTabs(tab);
	}, 
	reusetab : function() {
		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
		                     				.getService(Components.interfaces.nsIWindowMediator);
		var browserEnumerator = wm.getEnumerator("navigator:browser");

		var found = false;
		while (!found && browserEnumerator.hasMoreElements()) {
		   	var browserWin = browserEnumerator.getNext();
		   	var tabbrowser = browserWin.gBrowser;

		   	var numTabs = tabbrowser.browsers.length;
		   	for (var index = 0; index < numTabs; index++) {

		   		var currentBrowser = tabbrowser.getBrowserAtIndex(index);
	    		if (currentBrowser.currentURI.spec.match("^"+resetKiosk.prefManager.getCharPref("browser.startup.homepage")) ) {
	        		tabbrowser.selectedTab = tabbrowser.tabContainer.childNodes[index];
	        		browserWin.focus();
		       		found = true;
		       		resetKiosk.removeExtraTabs(tabbrowser.tabContainer.childNodes[index]);
		       		break;
				}
				
		   	}
		}
		
		if (!found) resetKiosk.reloadtab();
		
	},
	perform : function(event) {
		if (resetKiosk.prefManager.getBoolPref("extensions.resetKiosk.reuseExisting")) {
			resetKiosk.reusetab();
		} else {
			resetKiosk.reloadtab();
		}
		if (resetKiosk.prefManager.getBoolPref("extensions.resetKiosk.forceFullscreen")) {
			window.fullScreen = true;
		}
		if (resetKiosk.prefManager.getBoolPref("extensions.resetKiosk.clearHistory")) {
			Components.classes["@mozilla.org/browser/nav-history-service;1"]
                                        .getService(Components.interfaces.nsIBrowserHistory)
                                        .removeAllPages();
		}
		if (resetKiosk.prefManager.getBoolPref("extensions.resetKiosk.clearCookies")) {
			Components.classes["@mozilla.org/cookiemanager;1"]
                            			.getService(Components.interfaces.nsICookieManager)
										.removeAll();
		}
		if (resetKiosk.prefManager.getBoolPref("extensions.resetKiosk.clearCache")) {
			var cacheService = Components.classes["@mozilla.org/network/cache-service;1"]
										.getService(Components.interfaces.nsICacheService);

        	cacheService.evictEntries(Components.interfaces.nsICache.STORE_IN_MEMORY);
        	cacheService.evictEntries(Components.interfaces.nsICache.STORE_ON_DISK);
        	cacheService.evictEntries(Components.interfaces.nsICache.STORE_OFFLINE);
		}

	},
	disable : function(event) {
		event.preventDefault();
		console.debug('event default disabled');
	},
	loadhandler : function(event) {
		console.debug('load doc ' + event.originalTarget.defaultView.location.href);
		if (resetKiosk.prefManager.getBoolPref("extensions.resetKiosk.disableContextMenu")) {
			event.originalTarget.addEventListener("contextmenu", resetKiosk.disable, false);
		}
	}
}

addEventListener("keypress", resetKiosk.init, true);
addEventListener("mousemove", resetKiosk.init, true);
addEventListener("load", resetKiosk.loadhandler, true);
