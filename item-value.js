(function() {
  var attachPrice = function(item) {
    var itemName = util.getItemName(item);
    util.getItemPrice(itemName, function(price) {
      if (price != null) {
        item.prepend('<div class="value">' + price + '</div>');
      }
    });
  };


  $('.item:not(:has(.value))').each(function(i) {
    attachPrice($(this));
  });
})();
