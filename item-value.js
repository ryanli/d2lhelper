$('.item:not(:has(.value))').each(function(i) {
  // don't use the .smallimg's alt attr since it doesn't have quality prefix
  var itemName = $($($($(this).parent()).children('.name')[0]).children('b')[0]).text().trim();
  var url = 'http://steamcommunity.com/market/priceoverview/?currency=1&appid=570&market_hash_name=' + encodeURIComponent(itemName);
  $.ajax({
    url: url,
    context: this,
    success: function(data) {
      $(this).prepend('<div class="value">' + data.lowest_price + '</div>');
    }
  });
});
