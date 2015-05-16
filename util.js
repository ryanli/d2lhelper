var util = {};

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
    if (itemName == '') {
      callback(null);
    } else {
      var url = 'http://steamcommunity.com/market/priceoverview/?currency=1&appid=570&market_hash_name=' + encodeURIComponent(itemName);
      $.ajax({
        url: url,
        context: this,
        success: function(data) {
          callback(data.lowest_price);
        },
        err: function(data) {
          callback(null);
        }
      });
    }
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


  var getItemName = function(item) {
    return $($($($(item).parent()).children('.name')[0]).children('b')[0]).text().trim();
  };


  util.getItemPrice = getItemPrice;
  util.getItemName = getItemName;
})();
