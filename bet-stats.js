var isKey = function(item) {
	var img = item.getElementsByTagName('img')[0];
	return (img.src.match(/\/15003\.jpg$/) != null);
};

var countGain = function(row) {
	var keys = 0;
	var rares = 0;
	var uncommons = 0;
	var commons = 0;

	var commonItems = row.getElementsByClassName('Common');
	var i;
	for (i = 0; i < commonItems.length; ++i) {
		if (isKey(commonItems[i].parentNode)) {
			++keys;
		} else {
			++commons;
		}
	}
	rares = row.getElementsByClassName('Rare').length;
	uncommons = row.getElementsByClassName('Uncommon').length;
	return {
		keys: keys,
		rares: rares,
		uncommons: uncommons,
		commons: commons
	};
};

var ajaxCont = document.getElementById('ajaxCont');
if (ajaxCont != null) {
	ajaxCont.addEventListener('DOMSubtreeModified', function(ev) {
		var losses = ajaxCont.getElementsByClassName('lost').length;
		var wins = ajaxCont.getElementsByClassName('won').length;
		var isBetHistory = (losses > 0) || (wins > 0);

		if (isBetHistory && !document.getElementById('betStats')) {
			var keysGain = 0;
			var raresGain = 0;
			var uncommonsGain = 0;
			var commonsGain = 0;
			var totalWins = 0;
			var totalGames = 0;
			var teamMap = {};

			var betTable = ajaxCont.getElementsByTagName('table')[0];
			var betRows = betTable.getElementsByTagName('tr');
			for (var n = 0; n < betRows.length - 2; n += 3) {
				var won = (betRows[n].getElementsByClassName('won').length > 0);
				var lost = (betRows[n].getElementsByClassName('lost').length > 0);
				var closed = (!won && !lost);

				var teamA = betRows[n].getElementsByTagName('a')[1].textContent;
				var teamB = betRows[n].getElementsByTagName('a')[3].textContent;

				if (!closed) {
					if (!teamMap[teamA]) {
						teamMap[teamA] = { 'wins': 0, 'games': 0 };
					}
					if (!teamMap[teamB]) {
						teamMap[teamB] = { 'wins': 0, 'games': 0 };
					}
					++teamMap[teamA].games;
					++teamMap[teamB].games;
					++totalGames;
				}

				if (won) {
					var gain = countGain(betRows[n + 2]);
					keysGain += gain.keys;
					raresGain += gain.rares;
					uncommonsGain += gain.uncommons;
					commonsGain += gain.commons;
					++teamMap[teamA].wins;
					++teamMap[teamB].wins;
					++totalWins;
				} else if (lost) {
					var loss = countGain(betRows[n + 1]);
					keysGain -= loss.keys;
					raresGain -= loss.rares;
					uncommonsGain -= loss.uncommons;
					commonsGain -= loss.commons;
				}
			}
			var betStats = document.createElement('div');
			betStats.id = 'betStats';
			betTable.parentNode.insertBefore(betStats, betTable);
			betStats.style.display = 'none';

			var betStatsToggler = document.createElement('h3');
			betStatsToggler.id = 'betStatsToggler';
			betStatsToggler.textContent = 'Bet Stats';
			betStats.parentNode.insertBefore(betStatsToggler, betStats);
			betStatsToggler.addEventListener('click', function(ev) {
				if (betStats.style.display == 'none') {
					betStats.style.display = 'block';
				} else {
					betStats.style.display = 'none';
				}
			}, false);

			var betProfit = document.createElement('div');
			betProfit.id = 'betProfit';
			betProfit.textContent = 'Profit from betting: ' + keysGain + ' keys, ' + raresGain + ' rares, ' + uncommonsGain + ' uncommons, ' + commonsGain + ' commons';
			betStats.appendChild(betProfit);

			var overallRate = document.createElement('div');
			overallRate.id = 'overallRate';
			overallRate.textContent = 'Overall win rate: ' + totalWins + ' / ' + totalGames + ' (' + (totalWins / totalGames * 100).toFixed(2) + '%)';
			betStats.appendChild(overallRate);

			var perTeamStats = document.createElement('ul');
			perTeamStats.id = 'perTeamStats';

			var teamList = [];
			for (var team in teamMap) {
				teamList.push({'name': team, 'wins': teamMap[team].wins, 'games': teamMap[team].games, 'ratio': teamMap[team].wins / teamMap[team].games});
			}
			teamList.sort(function(a, b) {
				if (a.ratio != b.ratio) {
					return b.ratio - a.ratio;
				} else if (a.games != b.games) {
					return b.games - a.games;
				}
				return 0;
			});
			for (var i = 0; i < teamList.length; ++i) {
				var team = teamList[i];
				var item = document.createElement('li');
				item.textContent += team.name + ': ' + team.wins + '/' + team.games + ' (' + (team.ratio * 100).toFixed(2) + '%)';
				perTeamStats.appendChild(item);
			}
			betStats.appendChild(perTeamStats);
		}
	}, false);
}
