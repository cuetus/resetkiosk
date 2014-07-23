
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
	reloadtab : function() {
		var tab = gBrowser.addTab(resetKiosk.prefManager.getCharPref("browser.startup.homepage"));
		gBrowser.removeAllTabsBut(tab);
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
					tabbrowser.removeAllTabsBut(tabbrowser.selectedTab);
		       		found = true;
		       		break;
				}
		   	}
		}
		
		if (!found) resetKiosk.reloadtab();
		
	},
	closeAllBrowsersButCurrent : function() {

		// seems it cannot be done . . . 
		
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
		
		resetKiosk.closeAllBrowsersButCurrent();
	}
}

addEventListener("keypress", resetKiosk.init, true);
addEventListener("mousemove", resetKiosk.init, true);	


