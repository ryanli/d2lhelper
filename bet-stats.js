var getItemValue = (function() {
  var map = {};
  var impl = function(name, callback) {
    if (map[name] != null) {
      callback(null, map[name]);
    } else {
      var url = 'http://steamcommunity.com/market/priceoverview/?currency=1&appid=570&market_hash_name=' + encodeURIComponent(name);
      $.ajax({
        url: url,
        success: function(data) {
          var price = (data.lowest_price && parseFloat(data.lowest_price.replace(/^&#36;/, ''))) || 0;
          map[name] = price;
          callback(null, price);
        },
        err: function(data) {
          callback(null, 0);
        }
      });
    }
  };
  return impl;
})();

$('#ajaxCont').on('DOMSubtreeModified', function(ev) {
	var losses = $('#ajaxCont .lost').length;
	var wins = $('#ajaxCont .won').length;
	var isBetHistory = (losses > 0) || (wins > 0);

	if (isBetHistory && ($('#betStats').length === 0)) {
	  $('#ajaxCont').prepend('<div id="betStats"><h3>Bet Stats</h3><div id="betStatsDetails"><progress></progress></div></div>');
	  $('#betStats h3').on('click', function() {
	    $('#betStatsDetails').toggle();
    });

    $('#betStats progress').attr('max', $('#ajaxCont .item').length);

    var count = 0;
	  async.eachLimit($('#ajaxCont .item'), 20, function(item, callback) {
	    var itemName = $($($(item).children('.name')[0]).children('b')[0]).text().trim();
	    getItemValue(itemName, function(err, value) {
	      $('#betStats progress').attr('value', ++count);
	      if (count == $('#betStats progress').attr('max')) {
	        $('#betStats progress').hide();
	      }
	      $(item).prepend('<div class="value">$%s</div>'.replace(/%s/, value.toFixed(2)));
	      $(item).data('value', value);
	      callback(null);
      });
    }, function(err) {
      if (!err) {
        var winnings = 0;
        $('#ajaxCont table tr:nth-child(3n+1):has(.won)').each(function() {
          winnings += $(this).next().next().find('.item').get().reduce(function(prev, cur) { return prev + $(cur).data('value'); }, 0);
        });
        $('#ajaxCont table tr:nth-child(3n+1):has(.lost)').each(function() {
          winnings -= $(this).next().find('.item').get().reduce(function(prev, cur) { return prev + $(cur).data('value'); }, 0);
        });
        $('#betStatsDetails').append('<div id="betStatsDetailsSummary">Total winnings: $' + winnings.toFixed(2) + '</div>');
      }
    });
	}
});
