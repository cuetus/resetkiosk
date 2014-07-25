

var resetKiosk = {
	
	timer	: Components.classes["@mozilla.org/timer;1"]
						.createInstance(Components.interfaces.nsITimer), 

	prefManager : Components.classes["@mozilla.org/preferences-service;1"]
	                    .getService(Components.interfaces.nsIPrefBranch),
	
	init : function() {
		console.debug('resetKiosk.init');
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
	checkFullscreen : function() {
		console.debug('resetKiosk.checkFullscreen');
		if (!window.fullScreen && resetKiosk.prefManager.getBoolPref("extensions.resetKiosk.forceFullscreen")) {
			var element = gBrowser.selectedBrowser.contentDocument.documentElement;
			if (element.mozRequestFullScreen && resetKiosk.prefManager.getBoolPref("extensions.resetKiosk.noNavBar")) {
				element.mozRequestFullScreen(); // firefox 10 and up
			} else {
				window.fullScreen = true; // 1.9 and up. if mozRequestFullScreen was not defined
			}
		}
	},
	perform : function(event) {
		console.debug('resetKiosk.perform');
		if (resetKiosk.prefManager.getBoolPref("extensions.resetKiosk.reuseExisting")) {
			resetKiosk.reusetab();
		} else {
			resetKiosk.reloadtab();
		}

		resetKiosk.checkFullscreen();

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
		console.debug('resetKiosk.disable');
		event.preventDefault();
	},
	loadhandler : function(event) {
		console.debug('resetKiosk.loadhandler doc ' + event.originalTarget.defaultView.location.href);
		resetKiosk.checkFullscreen();
		if (resetKiosk.prefManager.getBoolPref("extensions.resetKiosk.disableContextMenu")) {
			event.originalTarget.addEventListener("contextmenu", resetKiosk.disable, false);
		}
	}
}


addEventListener("keydown", resetKiosk.init, true);
addEventListener("mousemove", resetKiosk.init, true);
gBrowser.addEventListener("load", resetKiosk.loadhandler, true);

if (resetKiosk.prefManager.getBoolPref("extensions.resetKiosk.stayFullscreen")) {
	addEventListener("mozfullscreenchange", resetKiosk.checkFullscreen, true); // firefox 10 and up
}

resetKiosk.init();



