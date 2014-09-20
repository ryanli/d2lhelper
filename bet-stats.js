var MAX_CONCURRENT_REQUESTS = 10;

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

var incTeam = function(map, team, winnings) {
  if (map[team] == null) {
    map[team] = {
      bets: 1,
      won: 0 + (winnings >= 0),
      winnings: winnings
    };
  } else {
    ++map[team].bets;
    if (winnings >= 0) {
      ++map[team].won;
    }
    map[team].winnings += winnings;
  }
  return map;
};

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
	  async.eachLimit($('#ajaxCont .item'), MAX_CONCURRENT_REQUESTS, function(item, callback) {
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
        var teamMap = {};
        $('#ajaxCont table tr:nth-child(3n+1):has(.won)').each(function() {
          var thisWinnings = $(this).next().next().find('.item').get().reduce(function(prev, cur) { return prev + $(cur).data('value'); }, 0);
          var leftTeam = $($(this).children('td')[2]).text();
          var rightTeam = $($(this).children('td')[4]).text();
          incTeam(teamMap, leftTeam, thisWinnings);
          incTeam(teamMap, rightTeam, thisWinnings);
          winnings += thisWinnings;
        });
        $('#ajaxCont table tr:nth-child(3n+1):has(.lost)').each(function() {
          var thisWinnings = -$(this).next().find('.item').get().reduce(function(prev, cur) { return prev + $(cur).data('value'); }, 0);
          var leftTeam = $($(this).children('td')[2]).text();
          var rightTeam = $($(this).children('td')[4]).text();
          incTeam(teamMap, leftTeam, thisWinnings);
          incTeam(teamMap, rightTeam, thisWinnings);
          winnings += thisWinnings;
        });
        $('#betStatsDetails').append('<div id="betStatsDetailsSummary">Total winnings: $' + winnings.toFixed(2) + '</div>');
        var table = $('<table id="betStatsTable" class="tablesorter"></table>');
        table.append('<thead><tr><th>Team</th><th>Bets</th><th>Won</th><th>Win rate</th><th>Winnings</th></thead>');
        var tbody = $('<tbody></tbody>');
        table.append(tbody);
        for (var teamName in teamMap) {
          tbody.append('<tr><td>%name</td><td>%bets</td><td>%won</td><td>%rate</td><td>%winnings</td></tr>'
            .replace(/%name/, teamName)
            .replace(/%bets/, teamMap[teamName].bets)
            .replace(/%won/, teamMap[teamName].won)
            .replace(/%rate/, (100 * teamMap[teamName].won / teamMap[teamName].bets).toFixed(2) + '%')
            .replace(/%winnings/, (teamMap[teamName].winnings < 0) ? ('-$' + (-teamMap[teamName].winnings).toFixed(2)) : ('$' + teamMap[teamName].winnings.toFixed(2))));
        }
        $('#betStatsDetails').append(table);
        $('#betStatsTable').tablesorter();
      }
    });
	}
});
