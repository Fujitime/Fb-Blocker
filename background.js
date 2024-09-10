chrome.runtime.onInstalled.addListener(() => {
    chrome.declarativeNetRequest.updateDynamicRules({
      addRules: [
        {
          id: 1,
          priority: 1,
          action: { type: 'block' },
          condition: {
            urlFilter: '*://*.facebook.com/*',
            resourceTypes: ['main_frame']
          }
        }
      ],
      removeRuleIds: [1]
    });
  
    console.log('FB Blocker Extension Installed and Rules Applied');
  });
  
