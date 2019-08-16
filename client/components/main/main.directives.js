'use strict';

var app = angular.module('myApp.main.directives', []);

app.factory('CTLogin', [function() {
  return { active: '' };
}]);

app.directive('daySelector', ['gettextCatalog', function(gettextCatalog) {

  var link = function(scope, element, attrs) {

    scope.days_array = [
      { id: 1, name: gettextCatalog.getString('Mon') },
      { id: 2, name: gettextCatalog.getString('Tue') },
      { id: 3, name: gettextCatalog.getString('Wed') },
      { id: 4, name: gettextCatalog.getString('Thu') },
      { id: 5, name: gettextCatalog.getString('Fri') },
      { id: 6, name: gettextCatalog.getString('Sat') },
      { id: 0, name: gettextCatalog.getString('Sun') }
    ];

    scope.updateDays = function() {
      for (var day in scope.array ) {
        if (scope.array[day] === 1) {
          var i = scope.days.indexOf(day);
          if(i === -1) {
            scope.days.push(day);
          }
        } else {
          var j = scope.days.indexOf(day);
          if(j !== -1) {
            scope.days.splice(j, 1);
          }
        }
      }
    };

    var updateDays = function() {
      if (scope.days !== null && scope.days !== undefined) {
        for(var i = 0; i <= 6; i++) {
          if (scope.days.indexOf(i.toString()) > -1) {
            scope.array[i] = 1;
          }
          else {
            scope.array[i] = 0;
          }
        }
      }
    };

    updateDays();
  };

  return {
    link: link,
    scope: {
      days: '=',
      array: '=',
      active: '='
    },
    template:
      '<span ng-repeat=\'day in days_array\'>' +
      '<md-checkbox ng-disabled="!active" id=\'day_{{day.id}}\' ng-change=\'updateDays()\' ng-model=\'array[day.id]\' type=\'checkbox\' ng-true-value=\'1\', ng-false-value=\'0\' style=\'margin: 0 12px 10px 0;\'/>' +
      '{{ day.name }}' +
      '</md-checkbox>'+
      '</span>'
  };

}]);

app.directive('loader', function() {

  function link(scope) {
  }

  return {
    link: link,
    replace: true,
    template:
      '<div ng-show=\'loading\'>'+
      '<div style="margin-top: 40px;" layout="row" layout-sm="column" layout-align="center center">'+
      '<md-progress-circular md-mode="indeterminate"></md-progress-circular>'+
      '</div>'+
      '</div>'
    };
});

app.directive('currency', function() {

  var link = function(scope, element) {

    scope.currencies = {'United Arab Emirates Dirham':'AED','Afghan Afghani':'AFN','Albanian Lek':'ALL','Armenian Dram':'AMD','Netherlands Antillean Gulden':'ANG','Angolan Kwanza':'AOA','Argentine Peso':'ARS','Australian Dollar':'AUD','Aruban Florin':'AWG','Azerbaijani Manat':'AZN','Bosnia and Herzegovina Convertible Mark':'BAM','Barbadian Dollar':'BBD','Bangladeshi Taka':'BDT','Bulgarian Lev':'BGN','Bahraini Dinar':'BHD','Burundian Franc':'BIF','Bermudian Dollar':'BMD','Brunei Dollar':'BND','Bolivian Boliviano':'BOB','Brazilian Real':'BRL','Bahamian Dollar':'BSD','Bhutanese Ngultrum':'BTN','Botswana Pula':'BWP','Belarusian Ruble':'BYR','Belize Dollar':'BZD','Canadian Dollar':'CAD','Congolese Franc':'CDF','Swiss Franc':'CHF','Unidad de Fomento':'CLF','Chilean Peso':'CLP','Chinese Renminbi Yuan':'CNY','Colombian Peso':'COP','Costa Rican Colón':'CRC','Cuban Convertible Peso':'CUC','Cuban Peso':'CUP','Cape Verdean Escudo':'CVE','Czech Koruna':'CZK','Djiboutian Franc':'DJF','Danish Krone':'DKK','Dominican Peso':'DOP','Algerian Dinar':'DZD','Egyptian Pound':'EGP','Eritrean Nakfa':'ERN','Ethiopian Birr':'ETB','Euro':'EUR','Fijian Dollar':'FJD','Falkland Pound':'FKP','British Pound':'GBP','Georgian Lari':'GEL','Ghanaian Cedi':'GHS','Gibraltar Pound':'GIP','Gambian Dalasi':'GMD','Guinean Franc':'GNF','Guatemalan Quetzal':'GTQ','Guyanese Dollar':'GYD','Hong Kong Dollar':'HKD','Honduran Lempira':'HNL','Croatian Kuna':'HRK','Haitian Gourde':'HTG','Hungarian Forint':'HUF','Indonesian Rupiah':'IDR','Israeli New Sheqel':'ILS','Indian Rupee':'INR','Iraqi Dinar':'IQD','Iranian Rial':'IRR','Icelandic Króna':'ISK','Jamaican Dollar':'JMD','Jordanian Dinar':'JOD','Japanese Yen':'JPY','Kenyan Shilling':'KES','Kyrgyzstani Som':'KGS','Cambodian Riel':'KHR','Comorian Franc':'KMF','North Korean Won':'KPW','South Korean Won':'KRW','Kuwaiti Dinar':'KWD','Cayman Islands Dollar':'KYD','Kazakhstani Tenge':'KZT','Lao Kip':'LAK','Lebanese Pound':'LBP','Sri Lankan Rupee':'LKR','Liberian Dollar':'LRD','Lesotho Loti':'LSL','Lithuanian Litas':'LTL','Latvian Lats':'LVL','Libyan Dinar':'LYD','Moroccan Dirham':'MAD','Moldovan Leu':'MDL','Malagasy Ariary':'MGA','Macedonian Denar':'MKD','Myanmar Kyat':'MMK','Mongolian Tögrög':'MNT','Macanese Pataca':'MOP','Mauritanian Ouguiya':'MRO','Mauritian Rupee':'MUR','Maldivian Rufiyaa':'MVR','Malawian Kwacha':'MWK','Mexican Peso':'MXN','Malaysian Ringgit':'MYR','Mozambican Metical':'MZN','Namibian Dollar':'NAD','Nigerian Naira':'NGN','Nicaraguan Córdoba':'NIO','Norwegian Krone':'NOK','Nepalese Rupee':'NPR','New Zealand Dollar':'NZD','Omani Rial':'OMR','Panamanian Balboa':'PAB','Peruvian Nuevo Sol':'PEN','Papua New Guinean Kina':'PGK','Philippine Peso':'PHP','Pakistani Rupee':'PKR','Polish Złoty':'PLN','Paraguayan Guaraní':'PYG','Qatari Riyal':'QAR','Romanian Leu':'RON','Serbian Dinar':'RSD','Russian Ruble':'RUB','Rwandan Franc':'RWF','Saudi Riyal':'SAR','Solomon Islands Dollar':'SBD','Seychellois Rupee':'SCR','Sudanese Pound':'SDG','Swedish Krona':'SEK','Singapore Dollar':'SGD','Saint Helenian Pound':'SHP','Slovak Koruna':'SKK','Sierra Leonean Leone':'SLL','Somali Shilling':'SOS','Surinamese Dollar':'SRD','South Sudanese Pound':'SSP','São Tomé and Príncipe Dobra':'STD','Salvadoran Colón':'SVC','Syrian Pound':'SYP','Swazi Lilangeni':'SZL','Thai Baht':'THB','Tajikistani Somoni':'TJS','Turkmenistani Manat':'TMT','Tunisian Dinar':'TND','Tongan Paʻanga':'TOP','Turkish Lira':'TRY','Trinidad and Tobago Dollar':'TTD','New Taiwan Dollar':'TWD','Tanzanian Shilling':'TZS','Ukrainian Hryvnia':'UAH','Ugandan Shilling':'UGX','United States Dollar':'USD','Uruguayan Peso':'UYU','Uzbekistani Som':'UZS','Venezuelan Bolívar':'VEF','Vietnamese Đồng':'VND','Vanuatu Vatu':'VUV','East Caribbean Dollar':'XCD','Cfp Franc':'XPF','Yemeni Rial':'YER','South African Rand':'ZAR','Zambian Kwacha':'ZMK','Bitcoin':'BTC','Jersey Pound':'JEP','Estonian Kroon':'EEK','Maltese Lira':'MTL','Zimbabwean Dollar':'ZWD'};

  };

  return {
    link: link,
    scope: {
      model: '='
    },
    templateUrl: 'components/main/_currency.html',
  };


});

app.directive('countrySelect', ['$parse', 'gettextCatalog', function($parse, gettextCatalog) {

  var countries = [
    { code: 'af', name: gettextCatalog.getString('Afghanistan') },
    { code: 'ax', name: gettextCatalog.getString('Åland Islands') },
    { code: 'al', name: gettextCatalog.getString('Albania') },
    { code: 'dz', name: gettextCatalog.getString('Algeria') },
    { code: 'as', name: gettextCatalog.getString('American Samoa') },
    { code: 'ad', name: gettextCatalog.getString('Andorra') },
    { code: 'ao', name: gettextCatalog.getString('Angola') },
    { code: 'ai', name: gettextCatalog.getString('Anguilla') },
    { code: 'aq', name: gettextCatalog.getString('Antarctica') },
    { code: 'ag', name: gettextCatalog.getString('Antigua and Barbuda') },
    { code: 'ar', name: gettextCatalog.getString('Argentina') },
    { code: 'am', name: gettextCatalog.getString('Armenia') },
    { code: 'aw', name: gettextCatalog.getString('Aruba') },
    { code: 'au', name: gettextCatalog.getString('Australia') },
    { code: 'at', name: gettextCatalog.getString('Austria') },
    { code: 'az', name: gettextCatalog.getString('Azerbaijan') },
    { code: 'bs', name: gettextCatalog.getString('Bahamas') },
    { code: 'bh', name: gettextCatalog.getString('Bahrain') },
    { code: 'bd', name: gettextCatalog.getString('Bangladesh') },
    { code: 'bb', name: gettextCatalog.getString('Barbados') },
    { code: 'by', name: gettextCatalog.getString('Belarus') },
    { code: 'be', name: gettextCatalog.getString('Belgium') },
    { code: 'bz', name: gettextCatalog.getString('Belize') },
    { code: 'bj', name: gettextCatalog.getString('Benin') },
    { code: 'bm', name: gettextCatalog.getString('Bermuda') },
    { code: 'bt', name: gettextCatalog.getString('Bhutan') },
    { code: 'bo', name: gettextCatalog.getString('Bolivia, Plurinational State of') },
    { code: 'bq', name: gettextCatalog.getString('Bonaire, Sint Eustatius and Saba') },
    { code: 'ba', name: gettextCatalog.getString('Bosnia and Herzegovina') },
    { code: 'bw', name: gettextCatalog.getString('Botswana') },
    { code: 'bv', name: gettextCatalog.getString('Bouvet Island') },
    { code: 'br', name: gettextCatalog.getString('Brazil') },
    { code: 'io', name: gettextCatalog.getString('British Indian Ocean Territory') },
    { code: 'bn', name: gettextCatalog.getString('Brunei Darussalam') },
    { code: 'bg', name: gettextCatalog.getString('Bulgaria') },
    { code: 'bf', name: gettextCatalog.getString('Burkina Faso') },
    { code: 'bi', name: gettextCatalog.getString('Burundi') },
    { code: 'kh', name: gettextCatalog.getString('Cambodia') },
    { code: 'cm', name: gettextCatalog.getString('Cameroon') },
    { code: 'ca', name: gettextCatalog.getString('Canada') },
    { code: 'cv', name: gettextCatalog.getString('Cape Verde') },
    { code: 'ky', name: gettextCatalog.getString('Cayman Islands') },
    { code: 'cf', name: gettextCatalog.getString('Central African Republic') },
    { code: 'td', name: gettextCatalog.getString('Chad') },
    { code: 'cl', name: gettextCatalog.getString('Chile') },
    { code: 'cn', name: gettextCatalog.getString('China') },
    { code: 'cx', name: gettextCatalog.getString('Christmas Island') },
    { code: 'cc', name: gettextCatalog.getString('Cocos (Keeling) Islands') },
    { code: 'co', name: gettextCatalog.getString('Colombia') },
    { code: 'km', name: gettextCatalog.getString('Comoros') },
    { code: 'cg', name: gettextCatalog.getString('Congo') },
    { code: 'cd', name: gettextCatalog.getString('Congo, the Democratic Republic of the') },
    { code: 'ck', name: gettextCatalog.getString('Cook Islands') },
    { code: 'cr', name: gettextCatalog.getString('Costa Rica') },
    { code: 'ci', name: gettextCatalog.getString('Côte d\'Ivoire') },
    { code: 'hr', name: gettextCatalog.getString('Croatia') },
    { code: 'cu', name: gettextCatalog.getString('Cuba') },
    { code: 'cw', name: gettextCatalog.getString('Curaçao') },
    { code: 'cy', name: gettextCatalog.getString('Cyprus') },
    { code: 'cz', name: gettextCatalog.getString('Czech Republic') },
    { code: 'dk', name: gettextCatalog.getString('Denmark') },
    { code: 'dj', name: gettextCatalog.getString('Djibouti') },
    { code: 'dm', name: gettextCatalog.getString('Dominica') },
    { code: 'do', name: gettextCatalog.getString('Dominican Republic') },
    { code: 'ec', name: gettextCatalog.getString('Ecuador') },
    { code: 'eg', name: gettextCatalog.getString('Egypt') },
    { code: 'sv', name: gettextCatalog.getString('El Salvador') },
    { code: 'gq', name: gettextCatalog.getString('Equatorial Guinea') },
    { code: 'er', name: gettextCatalog.getString('Eritrea') },
    { code: 'ee', name: gettextCatalog.getString('Estonia') },
    { code: 'et', name: gettextCatalog.getString('Ethiopia') },
    { code: 'fk', name: gettextCatalog.getString('Falkland Islands (Malvinas)') },
    { code: 'fo', name: gettextCatalog.getString('Faroe Islands') },
    { code: 'fj', name: gettextCatalog.getString('Fiji') },
    { code: 'fi', name: gettextCatalog.getString('Finland') },
    { code: 'fr', name: gettextCatalog.getString('France') },
    { code: 'gf', name: gettextCatalog.getString('French Guiana') },
    { code: 'pf', name: gettextCatalog.getString('French Polynesia') },
    { code: 'tf', name: gettextCatalog.getString('French Southern Territories') },
    { code: 'ga', name: gettextCatalog.getString('Gabon') },
    { code: 'gm', name: gettextCatalog.getString('Gambia') },
    { code: 'ge', name: gettextCatalog.getString('Georgia') },
    { code: 'de', name: gettextCatalog.getString('Germany') },
    { code: 'gh', name: gettextCatalog.getString('Ghana') },
    { code: 'gi', name: gettextCatalog.getString('Gibraltar') },
    { code: 'gr', name: gettextCatalog.getString('Greece') },
    { code: 'gl', name: gettextCatalog.getString('Greenland') },
    { code: 'gd', name: gettextCatalog.getString('Grenada') },
    { code: 'gp', name: gettextCatalog.getString('Guadeloupe') },
    { code: 'gu', name: gettextCatalog.getString('Guam') },
    { code: 'gt', name: gettextCatalog.getString('Guatemala') },
    { code: 'gg', name: gettextCatalog.getString('Guernsey') },
    { code: 'gn', name: gettextCatalog.getString('Guinea') },
    { code: 'gw', name: gettextCatalog.getString('Guinea-Bissau') },
    { code: 'gy', name: gettextCatalog.getString('Guyana') },
    { code: 'ht', name: gettextCatalog.getString('Haiti') },
    { code: 'hm', name: gettextCatalog.getString('Heard Island and McDonald Islands') },
    { code: 'va', name: gettextCatalog.getString('Holy See (Vatican City State)') },
    { code: 'hn', name: gettextCatalog.getString('Honduras') },
    { code: 'hk', name: gettextCatalog.getString('Hong Kong') },
    { code: 'hu', name: gettextCatalog.getString('Hungary') },
    { code: 'is', name: gettextCatalog.getString('Iceland') },
    { code: 'in', name: gettextCatalog.getString('India') },
    { code: 'id', name: gettextCatalog.getString('Indonesia') },
    { code: 'ir', name: gettextCatalog.getString('Iran, Islamic Republic of') },
    { code: 'iq', name: gettextCatalog.getString('Iraq') },
    { code: 'ie', name: gettextCatalog.getString('Ireland') },
    { code: 'im', name: gettextCatalog.getString('Isle of Man') },
    { code: 'il', name: gettextCatalog.getString('Israel') },
    { code: 'it', name: gettextCatalog.getString('Italy') },
    { code: 'jm', name: gettextCatalog.getString('Jamaica') },
    { code: 'jp', name: gettextCatalog.getString('Japan') },
    { code: 'je', name: gettextCatalog.getString('Jersey') },
    { code: 'jo', name: gettextCatalog.getString('Jordan') },
    { code: 'kz', name: gettextCatalog.getString('Kazakhstan') },
    { code: 'ke', name: gettextCatalog.getString('Kenya') },
    { code: 'ki', name: gettextCatalog.getString('Kiribati') },
    { code: 'kp', name: gettextCatalog.getString('Korea, Democratic People\'s Republic of') },
    { code: 'kr', name: gettextCatalog.getString('Korea, Republic of') },
    { code: 'kw', name: gettextCatalog.getString('Kuwait') },
    { code: 'kg', name: gettextCatalog.getString('Kyrgyzstan') },
    { code: 'la', name: gettextCatalog.getString('Lao People\'s Democratic Republic') },
    { code: 'lv', name: gettextCatalog.getString('Latvia') },
    { code: 'lb', name: gettextCatalog.getString('Lebanon') },
    { code: 'ls', name: gettextCatalog.getString('Lesotho') },
    { code: 'lr', name: gettextCatalog.getString('Liberia') },
    { code: 'ly', name: gettextCatalog.getString('Libya') },
    { code: 'li', name: gettextCatalog.getString('Liechtenstein') },
    { code: 'lt', name: gettextCatalog.getString('Lithuania') },
    { code: 'lu', name: gettextCatalog.getString('Luxembourg') },
    { code: 'mo', name: gettextCatalog.getString('Macao') },
    { code: 'mk', name: gettextCatalog.getString('Macedonia, the former Yugoslav Republic of') },
    { code: 'mg', name: gettextCatalog.getString('Madagascar') },
    { code: 'mw', name: gettextCatalog.getString('Malawi') },
    { code: 'my', name: gettextCatalog.getString('Malaysia') },
    { code: 'mv', name: gettextCatalog.getString('Maldives') },
    { code: 'ml', name: gettextCatalog.getString('Mali') },
    { code: 'mt', name: gettextCatalog.getString('Malta') },
    { code: 'mh', name: gettextCatalog.getString('Marshall Islands') },
    { code: 'mq', name: gettextCatalog.getString('Martinique') },
    { code: 'mr', name: gettextCatalog.getString('Mauritania') },
    { code: 'mu', name: gettextCatalog.getString('Mauritius') },
    { code: 'yt', name: gettextCatalog.getString('Mayotte') },
    { code: 'mx', name: gettextCatalog.getString('Mexico') },
    { code: 'fm', name: gettextCatalog.getString('Micronesia, Federated States of') },
    { code: 'md', name: gettextCatalog.getString('Moldova, Republic of') },
    { code: 'mc', name: gettextCatalog.getString('Monaco') },
    { code: 'mn', name: gettextCatalog.getString('Mongolia') },
    { code: 'me', name: gettextCatalog.getString('Montenegro') },
    { code: 'ms', name: gettextCatalog.getString('Montserrat') },
    { code: 'ma', name: gettextCatalog.getString('Morocco') },
    { code: 'mz', name: gettextCatalog.getString('Mozambique') },
    { code: 'mm', name: gettextCatalog.getString('Myanmar') },
    { code: 'na', name: gettextCatalog.getString('Namibia') },
    { code: 'nr', name: gettextCatalog.getString('Nauru') },
    { code: 'np', name: gettextCatalog.getString('Nepal') },
    { code: 'nl', name: gettextCatalog.getString('Netherlands') },
    { code: 'nc', name: gettextCatalog.getString('New Caledonia') },
    { code: 'nz', name: gettextCatalog.getString('New Zealand') },
    { code: 'ni', name: gettextCatalog.getString('Nicaragua') },
    { code: 'ne', name: gettextCatalog.getString('Niger') },
    { code: 'ng', name: gettextCatalog.getString('Nigeria') },
    { code: 'nu', name: gettextCatalog.getString('Niue') },
    { code: 'nf', name: gettextCatalog.getString('Norfolk Island') },
    { code: 'mp', name: gettextCatalog.getString('Northern Mariana Islands') },
    { code: 'no', name: gettextCatalog.getString('Norway') },
    { code: 'om', name: gettextCatalog.getString('Oman') },
    { code: 'pk', name: gettextCatalog.getString('Pakistan') },
    { code: 'pw', name: gettextCatalog.getString('Palau') },
    { code: 'ps', name: gettextCatalog.getString('Palestine, State of') },
    { code: 'pa', name: gettextCatalog.getString('Panama') },
    { code: 'pg', name: gettextCatalog.getString('Papua New Guinea') },
    { code: 'py', name: gettextCatalog.getString('Paraguay') },
    { code: 'pe', name: gettextCatalog.getString('Peru') },
    { code: 'ph', name: gettextCatalog.getString('Philippines') },
    { code: 'pn', name: gettextCatalog.getString('Pitcairn') },
    { code: 'pl', name: gettextCatalog.getString('Poland') },
    { code: 'pt', name: gettextCatalog.getString('Portugal') },
    { code: 'pr', name: gettextCatalog.getString('Puerto Rico') },
    { code: 'qa', name: gettextCatalog.getString('Qatar') },
    { code: 're', name: gettextCatalog.getString('Réunion') },
    { code: 'ro', name: gettextCatalog.getString('Romania') },
    { code: 'ru', name: gettextCatalog.getString('Russian Federation') },
    { code: 'rw', name: gettextCatalog.getString('Rwanda') },
    { code: 'bl', name: gettextCatalog.getString('Saint Barthélemy') },
    { code: 'sh', name: gettextCatalog.getString('Saint Helena, Ascension and Tristan da Cunha') },
    { code: 'kn', name: gettextCatalog.getString('Saint Kitts and Nevis') },
    { code: 'lc', name: gettextCatalog.getString('Saint Lucia') },
    { code: 'mf', name: gettextCatalog.getString('Saint Martin (French part)') },
    { code: 'pm', name: gettextCatalog.getString('Saint Pierre and Miquelon') },
    { code: 'vc', name: gettextCatalog.getString('Saint Vincent and the Grenadines') },
    { code: 'ws', name: gettextCatalog.getString('Samoa') },
    { code: 'sm', name: gettextCatalog.getString('San Marino') },
    { code: 'st', name: gettextCatalog.getString('Sao Tome and Principe') },
    { code: 'sa', name: gettextCatalog.getString('Saudi Arabia') },
    { code: 'sn', name: gettextCatalog.getString('Senegal') },
    { code: 'rs', name: gettextCatalog.getString('Serbia') },
    { code: 'sc', name: gettextCatalog.getString('Seychelles') },
    { code: 'sl', name: gettextCatalog.getString('Sierra Leone') },
    { code: 'sg', name: gettextCatalog.getString('Singapore') },
    { code: 'sx', name: gettextCatalog.getString('Sint Maarten (Dutch part)') },
    { code: 'sk', name: gettextCatalog.getString('Slovakia') },
    { code: 'si', name: gettextCatalog.getString('Slovenia') },
    { code: 'sb', name: gettextCatalog.getString('Solomon Islands') },
    { code: 'so', name: gettextCatalog.getString('Somalia') },
    { code: 'za', name: gettextCatalog.getString('South Africa') },
    { code: 'gs', name: gettextCatalog.getString('South Georgia and the South Sandwich Islands') },
    { code: 'ss', name: gettextCatalog.getString('South Sudan') },
    { code: 'es', name: gettextCatalog.getString('Spain') },
    { code: 'lk', name: gettextCatalog.getString('Sri Lanka') },
    { code: 'sd', name: gettextCatalog.getString('Sudan') },
    { code: 'sr', name: gettextCatalog.getString('Suriname') },
    { code: 'sj', name: gettextCatalog.getString('Svalbard and Jan Mayen') },
    { code: 'sz', name: gettextCatalog.getString('Swaziland') },
    { code: 'se', name: gettextCatalog.getString('Sweden') },
    { code: 'ch', name: gettextCatalog.getString('Switzerland') },
    { code: 'sy', name: gettextCatalog.getString('Syrian Arab Republic') },
    { code: 'tw', name: gettextCatalog.getString('Taiwan, Province of China') },
    { code: 'tj', name: gettextCatalog.getString('Tajikistan') },
    { code: 'tz', name: gettextCatalog.getString('Tanzania, United Republic of') },
    { code: 'th', name: gettextCatalog.getString('Thailand') },
    { code: 'tl', name: gettextCatalog.getString('Timor-Leste') },
    { code: 'tg', name: gettextCatalog.getString('Togo') },
    { code: 'tk', name: gettextCatalog.getString('Tokelau') },
    { code: 'to', name: gettextCatalog.getString('Tonga') },
    { code: 'tt', name: gettextCatalog.getString('Trinidad and Tobago') },
    { code: 'tn', name: gettextCatalog.getString('Tunisia') },
    { code: 'tr', name: gettextCatalog.getString('Turkey') },
    { code: 'tm', name: gettextCatalog.getString('Turkmenistan') },
    { code: 'tc', name: gettextCatalog.getString('Turks and Caicos Islands') },
    { code: 'tv', name: gettextCatalog.getString('Tuvalu') },
    { code: 'ug', name: gettextCatalog.getString('Uganda') },
    { code: 'ua', name: gettextCatalog.getString('Ukraine') },
    { code: 'ae', name: gettextCatalog.getString('United Arab Emirates') },
    { code: 'gb', name: gettextCatalog.getString('United Kingdom') },
    { code: 'us', name: gettextCatalog.getString('United States') },
    { code: 'um', name: gettextCatalog.getString('United States Minor Outlying Islands') },
    { code: 'uy', name: gettextCatalog.getString('Uruguay') },
    { code: 'uz', name: gettextCatalog.getString('Uzbekistan') },
    { code: 'vu', name: gettextCatalog.getString('Vanuatu') },
    { code: 've', name: gettextCatalog.getString('Venezuela, Bolivarian Republic of') },
    { code: 'vn', name: gettextCatalog.getString('Viet Nam') },
    { code: 'vg', name: gettextCatalog.getString('Virgin Islands, British') },
    { code: 'vi', name: gettextCatalog.getString('Virgin Islands, U.S.') },
    { code: 'wf', name: gettextCatalog.getString('Wallis and Futuna') },
    { code: 'eh', name: gettextCatalog.getString('Western Sahara') },
    { code: 'ye', name: gettextCatalog.getString('Yemen') },
    { code: 'zm', name: gettextCatalog.getString('Zambia') },
    { code: 'zw', name: gettextCatalog.getString('Zimbabwe') }
  ];

  var link = function(scope, elem, attrs) {
    scope.countries = [];
    countries.sort(function (a,b) {
      return a.name.localeCompare(b.name, { sensitivity: 'accent' });
    });
    for (var c in countries) {
      scope.countries.push(countries[c]);
    }
  };

  return {
    template:
      '<md-select ng-model="country" required>'+
      '<md-option ng-repeat=\'c in countries\' ng-value="c.code">'+
      '{{ c.name }}'+
      '</md-option>'+
      '</md-select>',
    replace: true,
    link: link,
    scope: {
      country: '='
    }
  };
}]);
