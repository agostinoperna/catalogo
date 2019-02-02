App = {
  web3Provider: null,
  contracts: {},
  account: 0x0,
  loading: false,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // inizializzazione di web3
    if(typeof web3 !== 'undefined') {
      //riutilizzare il fornitore dell'oggetto Web3 iniettato da Metamask
      App.web3Provider = web3.currentProvider;
    } else {
      //crea un nuovo provider e collegalo direttamente al nostro nodo locale
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    App.displayAccountInfo();

    return App.initContract();
  },

  displayAccountInfo: function() {
    web3.eth.getCoinbase(function(err, account) {
      if(err === null) {
        App.account = account;
        $('#account').text(account);
        web3.eth.getBalance(account, function(err, balance) {
          if(err === null) {
            $('#accountBalance').text(web3.fromWei(balance, "ether") + " ETH");
          }
        })
      }
    });
  },

  initContract: function() {
    $.getJSON('Catalogo.json', function(catalogoArtefatto) {
      // prendere il file artefatto del contratto ed usarlo per instanziare una astrazione in truffle
      App.contracts.Catalogo = TruffleContract(catalogoArtefatto);
      // impostare il provider per i nostri contratti
      App.contracts.Catalogo.setProvider(App.web3Provider);
      // ascoltare gli eventi
      App.ascoltaEventi();
      // recuperare gli articoli dal contratto
      return App.reloadArticles();
    });
  },

  reloadArticles: function() {
    // evitare il rientro
    if(App.loading) {
      return;
    }
    App.loading = true;

    // ricaricare le info degli account perchè il saldo potrebbe essere variato
    App.displayAccountInfo();

    var catalogoIstanza;

    App.contracts.Catalogo.deployed().then(function(instance) {
      catalogoIstanza = instance;
      return catalogoIstanza.getArticoliPerLaVendita();
    }).then(function(articleIds) {
      // recuperare l'id dell'articolo e cancellarlo
      $('#articlesRow').empty();

      for(var i = 0; i < articleIds.length; i++) {
        var articleId = articleIds[i];
        catalogoIstanza.articles(articleId.toNumber()).then(function(article){
          App.mostraArticoli(article[0], article[1], article[3], article[4], article[5]);
        });
      }
      App.loading = false;
    }).catch(function(err) {
      console.error(err.message);
      App.loading = false;
    });
  },

  mostraArticoli: function(id, venditore, name, descrizione, prezzo) {
    var articlesRow = $('#articlesRow');

    var etherprezzo = web3.fromWei(prezzo, "ether");

    var articleTemplate = $("#articleTemplate");
    articleTemplate.find('.panel-title').text(name);
    articleTemplate.find('.article-descrizione').text(descrizione);
    articleTemplate.find('.article-prezzo').text(etherprezzo + " ETH");
    articleTemplate.find('.btn-buy').attr('data-id', id);
    articleTemplate.find('.btn-buy').attr('data-value', etherprezzo);

    // venditore
    if (venditore == App.account) {
      articleTemplate.find('.article-venditore').text("sei tu il venditore");
      articleTemplate.find('.btn-buy').hide();
    } else {
      articleTemplate.find('.article-venditore').text(venditore);
      articleTemplate.find('.btn-buy').show();
    }

    // aggiungere un articolo
    articlesRow.append(articleTemplate.html());
  },

  vendiArticolo: function() {
    // recuperare i dettagli dell'articolo
    var _article_name = $('#article_name').val();
    var _descrizione = $('#article_descrizione').val();
    var _prezzo = web3.toWei(parseFloat($('#article_prezzo').val() || 0), "ether");

    if((_article_name.trim() == '') || (_prezzo == 0)) {
      // nulla da vendere
      return false;
    }

    App.contracts.Catalogo.deployed().then(function(instance) {
      return instance.vendiArticolo(_article_name, _descrizione, _prezzo, {
        from: App.account,
        gas: 500000
      });
    }).then(function(result) {

    }).catch(function(err) {
      console.error(err);
    });
  },

  // ascoltare gli eventi innescati dal contratto
  ascoltaEventi: function() {
    App.contracts.Catalogo.deployed().then(function(instance) {
      instance.LogVendiArticolo({}, {}).watch(function(error, event) {
        if (!error) {
          $("#events").append('<li class="list-group-item">' + event.args._name + ' è pronto per essere venduto </li>');
        } else {
          console.error(error);
        }
        App.reloadArticles();
      });

      instance.LogCompraArticolo({}, {}).watch(function(error, event) {
        if (!error) {
          $("#events").append('<li class="list-group-item">' +'Questo address <b>' +event.args._acquirente + '</b> ha acquistato ' + event.args._name + '</li>');
        } else {
          console.error(error);
        }
        App.reloadArticles();
      });
    });
  },

  compraArticolo: function() {
    event.preventDefault();

    // recuperare un articolo
    var _articleId = $(event.target).data('id');
    var _prezzo = parseFloat($(event.target).data('value'));

    App.contracts.Catalogo.deployed().then(function(instance){
      return instance.compraArticolo(_articleId, {
        from: App.account,
        value: web3.toWei(_prezzo, "ether"),
        gas: 500000
      });
    }).catch(function(error) {
      console.error(error);
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
