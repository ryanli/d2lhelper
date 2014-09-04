var items = document.getElementsByClassName("item");

$('.item').each(function(i) {
  var itemName = $($(this).children('.smallimg')[0]).attr('alt').trim();
  var url = 'http://steamcommunity.com/market/priceoverview/?currency=1&appid=570&market_hash_name=' + encodeURIComponent(itemName);
  $.ajax({
    url: url,
    context: this,
    success: function(data) {
      $(this).prepend('<div class="value">' + data.lowest_price + '</div>');
    }
  });
});
