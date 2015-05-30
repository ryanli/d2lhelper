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
    // Don't use the .smallimg's alt attr since it doesn't have quality prefix.
    // However the name in <b> might have double Genunine/Exalted prefix which we need to fix.
    var name = $($($($(item).parent()).children('.name')[0]).children('b')[0]).text();
    name = name.replace(/^Genuine Genuine/, 'Genuine')
               .replace(/^Exalted Exalted/, 'Exalted');
    return name.trim();
  };


  util.getItemPrice = getItemPrice;
  util.getItemName = getItemName;
})();
