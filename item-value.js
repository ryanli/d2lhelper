(function() {
  'use strict';

  var CACHE_TTL_MS = 30 * 60 * 1000;


  var setItemPrice = function(itemName, price) {
    var object = {};
    object[itemName] = {
      price: price,
      timestamp: (new Date()).getTime()
    };
    chrome.storage.local.set(object);
  };


  var getItemPriceFromStorage = function(itemName, callback) {
    chrome.storage.local.get(itemName, function(result) {
      if (!result[itemName]) {
        callback(null);
      } else if ((new Date()).getTime() - result[itemName].timestamp > CACHE_TTL_MS) {
        chrome.storage.local.remove(itemName);
        callback(null);
      } else {
        callback(result[itemName].price);
      }
    });
  };


  var getItemPriceFromMarket = function(itemName, callback) {
    var url = 'http://steamcommunity.com/market/priceoverview/?currency=1&appid=570&market_hash_name=' + encodeURIComponent(itemName);
    $.ajax({
      url: url,
      context: this,
      success: function(data) {
        callback(data.lowest_price);
      }
    });
  };


  var getItemPrice = function(itemName, callback) {
    getItemPriceFromStorage(itemName, function(price) {
      if (price == null) {
        getItemPriceFromMarket(itemName, function(price) {
          if (price != null) {
            setItemPrice(itemName, price);
          }
          callback(price);
        });
      } else {
        callback(price);
      }
    });
  };


  var attachPrice = function(item) {
    // don't use the .smallimg's alt attr since it doesn't have quality prefix
    var itemName = $($($(item.parent()).children('.name')[0]).children('b')[0]).text().trim();
    getItemPrice(itemName, function(price) {
      if (price != null) {
        item.prepend('<div class="value">' + price + '</div>');
      }
    });
  };


  $('.item:not(:has(.value))').each(function(i) {
    attachPrice($(this));
  });
})();
