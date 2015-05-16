(function() {
  var attachPrice = function(item) {
    // don't use the .smallimg's alt attr since it doesn't have quality prefix
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
