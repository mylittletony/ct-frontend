'use strict';

var app = angular.module('myApp.main.directives', []);

app.factory('CTLogin', [function() {
  return { active: '' };
}]);

app.directive('daySelector', ['gettextCatalog', function(gettextCatalog) {

  var link = function(scope, element, attrs) {

    scope.days_array = [{id:1, name: gettextCatalog.getString('Mon')},{id:2, name: gettextCatalog.getString('Tue')},{id:3, name: gettextCatalog.getString('Wed')},{id:4, name: gettextCatalog.getString('Thu')}, {id:5, name: gettextCatalog.getString('Fri')}, {id:6, name:gettextCatalog.getString('Sat')}, {id:0, name:gettextCatalog.getString('Sun')}];

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
      if (scope.days !== null) {
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

app.directive('countrySelect', ['$parse', function($parse) {

  var countries = [
    { code: 'af', name: 'Afghanistan' },
    { code: 'ax', name: 'Åland Islands' },
    { code: 'al', name: 'Albania' },
    { code: 'dz', name: 'Algeria' },
    { code: 'as', name: 'American Samoa' },
    { code: 'ad', name: 'Andorra' },
    { code: 'ao', name: 'Angola' },
    { code: 'ai', name: 'Anguilla' },
    { code: 'aq', name: 'Antarctica' },
    { code: 'ag', name: 'Antigua and Barbuda' },
    { code: 'ar', name: 'Argentina' },
    { code: 'am', name: 'Armenia' },
    { code: 'aw', name: 'Aruba' },
    { code: 'au', name: 'Australia' },
    { code: 'at', name: 'Austria' },
    { code: 'az', name: 'Azerbaijan' },
    { code: 'bs', name: 'Bahamas' },
    { code: 'bh', name: 'Bahrain' },
    { code: 'bd', name: 'Bangladesh' },
    { code: 'bb', name: 'Barbados' },
    { code: 'by', name: 'Belarus' },
    { code: 'be', name: 'Belgium' },
    { code: 'bz', name: 'Belize' },
    { code: 'bj', name: 'Benin' },
    { code: 'bm', name: 'Bermuda' },
    { code: 'bt', name: 'Bhutan' },
    { code: 'bo', name: 'Bolivia, Plurinational State of' },
    { code: 'bq', name: 'Bonaire, Sint Eustatius and Saba' },
    { code: 'ba', name: 'Bosnia and Herzegovina' },
    { code: 'bw', name: 'Botswana' },
    { code: 'bv', name: 'Bouvet Island' },
    { code: 'br', name: 'Brazil' },
    { code: 'io', name: 'British Indian Ocean Territory' },
    { code: 'bn', name: 'Brunei Darussalam' },
    { code: 'bg', name: 'Bulgaria' },
    { code: 'bf', name: 'Burkina Faso' },
    { code: 'bi', name: 'Burundi' },
    { code: 'kh', name: 'Cambodia' },
    { code: 'cm', name: 'Cameroon' },
    { code: 'ca', name: 'Canada' },
    { code: 'cv', name: 'Cape Verde' },
    { code: 'ky', name: 'Cayman Islands' },
    { code: 'cf', name: 'Central African Republic' },
    { code: 'td', name: 'Chad' },
    { code: 'cl', name: 'Chile' },
    { code: 'cn', name: 'China' },
    { code: 'cx', name: 'Christmas Island' },
    { code: 'cc', name: 'Cocos (Keeling) Islands' },
    { code: 'co', name: 'Colombia' },
    { code: 'km', name: 'Comoros' },
    { code: 'cg', name: 'Congo' },
    { code: 'cd', name: 'Congo, the Democratic Republic of the' },
    { code: 'ck', name: 'Cook Islands' },
    { code: 'cr', name: 'Costa Rica' },
    { code: 'ci', name: 'Côte d\'Ivoire' },
    { code: 'hr', name: 'Croatia' },
    { code: 'cu', name: 'Cuba' },
    { code: 'cw', name: 'Curaçao' },
    { code: 'cy', name: 'Cyprus' },
    { code: 'cz', name: 'Czech Republic' },
    { code: 'dk', name: 'Denmark' },
    { code: 'dj', name: 'Djibouti' },
    { code: 'dm', name: 'Dominica' },
    { code: 'do', name: 'Dominican Republic' },
    { code: 'ec', name: 'Ecuador' },
    { code: 'eg', name: 'Egypt' },
    { code: 'sv', name: 'El Salvador' },
    { code: 'gq', name: 'Equatorial Guinea' },
    { code: 'er', name: 'Eritrea' },
    { code: 'ee', name: 'Estonia' },
    { code: 'et', name: 'Ethiopia' },
    { code: 'fk', name: 'Falkland Islands (Malvinas)' },
    { code: 'fo', name: 'Faroe Islands' },
    { code: 'fj', name: 'Fiji' },
    { code: 'fi', name: 'Finland' },
    { code: 'fr', name: 'France' },
    { code: 'gf', name: 'French Guiana' },
    { code: 'pf', name: 'French Polynesia' },
    { code: 'tf', name: 'French Southern Territories' },
    { code: 'ga', name: 'Gabon' },
    { code: 'gm', name: 'Gambia' },
    { code: 'ge', name: 'Georgia' },
    { code: 'de', name: 'Germany' },
    { code: 'gh', name: 'Ghana' },
    { code: 'gi', name: 'Gibraltar' },
    { code: 'gr', name: 'Greece' },
    { code: 'gl', name: 'Greenland' },
    { code: 'gd', name: 'Grenada' },
    { code: 'gp', name: 'Guadeloupe' },
    { code: 'gu', name: 'Guam' },
    { code: 'gt', name: 'Guatemala' },
    { code: 'gg', name: 'Guernsey' },
    { code: 'gn', name: 'Guinea' },
    { code: 'gw', name: 'Guinea-Bissau' },
    { code: 'gy', name: 'Guyana' },
    { code: 'ht', name: 'Haiti' },
    { code: 'hm', name: 'Heard Island and McDonald Islands' },
    { code: 'va', name: 'Holy See (Vatican City State)' },
    { code: 'hn', name: 'Honduras' },
    { code: 'hk', name: 'Hong Kong' },
    { code: 'hu', name: 'Hungary' },
    { code: 'is', name: 'Iceland' },
    { code: 'in', name: 'India' },
    { code: 'id', name: 'Indonesia' },
    { code: 'ir', name: 'Iran, Islamic Republic of' },
    { code: 'iq', name: 'Iraq' },
    { code: 'ie', name: 'Ireland' },
    { code: 'im', name: 'Isle of Man' },
    { code: 'il', name: 'Israel' },
    { code: 'it', name: 'Italy' },
    { code: 'jm', name: 'Jamaica' },
    { code: 'jp', name: 'Japan' },
    { code: 'je', name: 'Jersey' },
    { code: 'jo', name: 'Jordan' },
    { code: 'kz', name: 'Kazakhstan' },
    { code: 'ke', name: 'Kenya' },
    { code: 'ki', name: 'Kiribati' },
    { code: 'kp', name: 'Korea, Democratic People\'s Republic of' },
    { code: 'kr', name: 'Korea, Republic of' },
    { code: 'kw', name: 'Kuwait' },
    { code: 'kg', name: 'Kyrgyzstan' },
    { code: 'la', name: 'Lao People\'s Democratic Republic' },
    { code: 'lv', name: 'Latvia' },
    { code: 'lb', name: 'Lebanon' },
    { code: 'ls', name: 'Lesotho' },
    { code: 'lr', name: 'Liberia' },
    { code: 'ly', name: 'Libya' },
    { code: 'li', name: 'Liechtenstein' },
    { code: 'lt', name: 'Lithuania' },
    { code: 'lu', name: 'Luxembourg' },
    { code: 'mo', name: 'Macao' },
    { code: 'mk', name: 'Macedonia, the former Yugoslav Republic of' },
    { code: 'mg', name: 'Madagascar' },
    { code: 'mw', name: 'Malawi' },
    { code: 'my', name: 'Malaysia' },
    { code: 'mv', name: 'Maldives' },
    { code: 'ml', name: 'Mali' },
    { code: 'mt', name: 'Malta' },
    { code: 'mh', name: 'Marshall Islands' },
    { code: 'mq', name: 'Martinique' },
    { code: 'mr', name: 'Mauritania' },
    { code: 'mu', name: 'Mauritius' },
    { code: 'yt', name: 'Mayotte' },
    { code: 'mx', name: 'Mexico' },
    { code: 'fm', name: 'Micronesia, Federated States of' },
    { code: 'md', name: 'Moldova, Republic of' },
    { code: 'mc', name: 'Monaco' },
    { code: 'mn', name: 'Mongolia' },
    { code: 'me', name: 'Montenegro' },
    { code: 'ms', name: 'Montserrat' },
    { code: 'ma', name: 'Morocco' },
    { code: 'mz', name: 'Mozambique' },
    { code: 'mm', name: 'Myanmar' },
    { code: 'na', name: 'Namibia' },
    { code: 'nr', name: 'Nauru' },
    { code: 'np', name: 'Nepal' },
    { code: 'nl', name: 'Netherlands' },
    { code: 'nc', name: 'New Caledonia' },
    { code: 'nz', name: 'New Zealand' },
    { code: 'ni', name: 'Nicaragua' },
    { code: 'ne', name: 'Niger' },
    { code: 'ng', name: 'Nigeria' },
    { code: 'nu', name: 'Niue' },
    { code: 'nf', name: 'Norfolk Island' },
    { code: 'mp', name: 'Northern Mariana Islands' },
    { code: 'no', name: 'Norway' },
    { code: 'om', name: 'Oman' },
    { code: 'pk', name: 'Pakistan' },
    { code: 'pw', name: 'Palau' },
    { code: 'ps', name: 'Palestine, State of' },
    { code: 'pa', name: 'Panama' },
    { code: 'pg', name: 'Papua New Guinea' },
    { code: 'py', name: 'Paraguay' },
    { code: 'pe', name: 'Peru' },
    { code: 'ph', name: 'Philippines' },
    { code: 'pn', name: 'Pitcairn' },
    { code: 'pl', name: 'Poland' },
    { code: 'pt', name: 'Portugal' },
    { code: 'pr', name: 'Puerto Rico' },
    { code: 'qa', name: 'Qatar' },
    { code: 're', name: 'Réunion' },
    { code: 'ro', name: 'Romania' },
    { code: 'ru', name: 'Russian Federation' },
    { code: 'rw', name: 'Rwanda' },
    { code: 'bl', name: 'Saint Barthélemy' },
    { code: 'sh', name: 'Saint Helena, Ascension and Tristan da Cunha' },
    { code: 'kn', name: 'Saint Kitts and Nevis' },
    { code: 'lc', name: 'Saint Lucia' },
    { code: 'mf', name: 'Saint Martin (French part)' },
    { code: 'pm', name: 'Saint Pierre and Miquelon' },
    { code: 'vc', name: 'Saint Vincent and the Grenadines' },
    { code: 'ws', name: 'Samoa' },
    { code: 'sm', name: 'San Marino' },
    { code: 'st', name: 'Sao Tome and Principe' },
    { code: 'sa', name: 'Saudi Arabia' },
    { code: 'sn', name: 'Senegal' },
    { code: 'rs', name: 'Serbia' },
    { code: 'sc', name: 'Seychelles' },
    { code: 'sl', name: 'Sierra Leone' },
    { code: 'sg', name: 'Singapore' },
    { code: 'sx', name: 'Sint Maarten (Dutch part)' },
    { code: 'sk', name: 'Slovakia' },
    { code: 'si', name: 'Slovenia' },
    { code: 'sb', name: 'Solomon Islands' },
    { code: 'so', name: 'Somalia' },
    { code: 'za', name: 'South Africa' },
    { code: 'gs', name: 'South Georgia and the South Sandwich Islands' },
    { code: 'ss', name: 'South Sudan' },
    { code: 'es', name: 'Spain' },
    { code: 'lk', name: 'Sri Lanka' },
    { code: 'sd', name: 'Sudan' },
    { code: 'sr', name: 'Suriname' },
    { code: 'sj', name: 'Svalbard and Jan Mayen' },
    { code: 'sz', name: 'Swaziland' },
    { code: 'se', name: 'Sweden' },
    { code: 'ch', name: 'Switzerland' },
    { code: 'sy', name: 'Syrian Arab Republic' },
    { code: 'tw', name: 'Taiwan, Province of China' },
    { code: 'tj', name: 'Tajikistan' },
    { code: 'tz', name: 'Tanzania, United Republic of' },
    { code: 'th', name: 'Thailand' },
    { code: 'tl', name: 'Timor-Leste' },
    { code: 'tg', name: 'Togo' },
    { code: 'tk', name: 'Tokelau' },
    { code: 'to', name: 'Tonga' },
    { code: 'tt', name: 'Trinidad and Tobago' },
    { code: 'tn', name: 'Tunisia' },
    { code: 'tr', name: 'Turkey' },
    { code: 'tm', name: 'Turkmenistan' },
    { code: 'tc', name: 'Turks and Caicos Islands' },
    { code: 'tv', name: 'Tuvalu' },
    { code: 'ug', name: 'Uganda' },
    { code: 'ua', name: 'Ukraine' },
    { code: 'ae', name: 'United Arab Emirates' },
    { code: 'gb', name: 'United Kingdom' },
    { code: 'us', name: 'United States' },
    { code: 'um', name: 'United States Minor Outlying Islands' },
    { code: 'uy', name: 'Uruguay' },
    { code: 'uz', name: 'Uzbekistan' },
    { code: 'vu', name: 'Vanuatu' },
    { code: 've', name: 'Venezuela, Bolivarian Republic of' },
    { code: 'vn', name: 'Viet Nam' },
    { code: 'vg', name: 'Virgin Islands, British' },
    { code: 'vi', name: 'Virgin Islands, U.S.' },
    { code: 'wf', name: 'Wallis and Futuna' },
    { code: 'eh', name: 'Western Sahara' },
    { code: 'ye', name: 'Yemen' },
    { code: 'zm', name: 'Zambia' },
    { code: 'zw', name: 'Zimbabwe'}
  ];

  var link = function(scope, elem, attrs) {
    scope.countries = countries;
  };

  return {
    template:
      '<md-select ng-model="country">'+
      '<md-option ng-repeat=\'c in countries\' value="{{ c.code }}">'+
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
