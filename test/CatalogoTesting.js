var Catalogo = artifacts.require("./Catalogo.sol");

// test suite
contract('Catalogo', function(accounts){
  var catalogoIstanza;
  var venditore = accounts[1];
  var acquirente = accounts[2];
  var articleName1 = "articolo 1";
  var articledescrizione1 = "descrizione per l'articolo 1";
  var articleprezzo1 = 10;
  var articleName2 = "articolo 2";
  var articledescrizione2 = "descrizione per l'articolo 2";
  var articleprezzo2 = 20;
  var venditoreBalanceBeforeBuy, venditoreBalanceAfterBuy;
  var acquirenteBalanceBeforeBuy, acquirenteBalanceAfterBuy;

  it("dovrebbe essere inizializzato con valori e campi vuoti", function() {
    return Catalogo.deployed().then(function(instance) {
      catalogoIstanza = instance;
      return catalogoIstanza.getNumeroDiArticoli();
    }).then(function(data) {
      assert.equal(data.toNumber(), 0, "il numero degli articoli dovrebbe essere 0 ");
      return catalogoIstanza.getArticoliPerLaVendita();
    }).then(function(data){
      assert.equal(data.length, 0, "non dovrebbe esserci alcun articolo per la vendita");
    });
  });

  // vendere il primo articolo
  it("dovrebbe essere venduto il primo articolo", function() {
    return Catalogo.deployed().then(function(instance){
      catalogoIstanza = instance;
      return catalogoIstanza.vendiArticolo(
        articleName1,
        articledescrizione1,
        web3.toWei(articleprezzo1, "ether"),
        {from: venditore}
      );
    }).then(function(receipt){
      // check event
      assert.equal(receipt.logs.length, 1, "un evento è stato innescato");
      assert.equal(receipt.logs[0].event, "LogVendiArticolo", "l'evento dovrebbe essere LogVendiArticolo");
      assert.equal(receipt.logs[0].args._id.toNumber(), 1, "l'id dovrebbe essere 1");
      assert.equal(receipt.logs[0].args._venditore, venditore, "l'evento venditore dovrebbe essere " + venditore);
      assert.equal(receipt.logs[0].args._name, articleName1, "l'evento nome-articolo dovrebbe essere  " + articleName1);
      assert.equal(receipt.logs[0].args._prezzo.toNumber(), web3.toWei(articleprezzo1, "ether"), "l'evento prezzo-articolo dovrebbe essere " + web3.toWei(articleprezzo1, "ether"));

      return catalogoIstanza.getNumeroDiArticoli();
    }).then(function(data) {
      assert.equal(data, 1, "il numero di articoli dovrebbe essere 1");

      return catalogoIstanza.getArticoliPerLaVendita();
    }).then(function(data) {
      assert.equal(data.length, 1, "dovrebbe esserci 1 articolo per la vendita");
      assert.equal(data[0].toNumber(), 1, "l'id dell'articolo dovrebbe essere 1");

      return catalogoIstanza.articles(data[0]);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 1, "l'id dell'articolo dovrebbe essere 1");
      assert.equal(data[1], venditore, "il venditore dovrebbe essere " + venditore);
      assert.equal(data[2], 0x0, "acquirente dovrebbe vuoto");
      assert.equal(data[3], articleName1, "il nome dell'articolo dovrebbe essere " + articleName1);
      assert.equal(data[4], articledescrizione1, "la descrizione dell'articolo dovrebbe essere " + articledescrizione1);
      assert.equal(data[5].toNumber(), web3.toWei(articleprezzo1, "ether"), "il prezzo dell'articolo dovrebbe essere " + web3.toWei(articleprezzo1, "ether"));
    });
  });

  // vendere un secondo articolo
  it("si dovrebbe vendere il secondo articolo", function() {
    return Catalogo.deployed().then(function(instance){
      catalogoIstanza = instance;
      return catalogoIstanza.vendiArticolo(
        articleName2,
        articledescrizione2,
        web3.toWei(articleprezzo2, "ether"),
        {from: venditore}
      );
    }).then(function(receipt){
      // check event
      assert.equal(receipt.logs.length, 1, "un evento dovrebbe essere stato innescato");
      assert.equal(receipt.logs[0].event, "LogVendiArticolo", "l'evento dovrebbe essere LogVendiArticolo");
      assert.equal(receipt.logs[0].args._id.toNumber(), 2, "l'id dovrebbe essere 2");
      assert.equal(receipt.logs[0].args._venditore, venditore, "l'evento venditore dovrebbe essere " + venditore);
      assert.equal(receipt.logs[0].args._name, articleName2, "l'evento nome-articolo dovrebbe essere " + articleName2);
      assert.equal(receipt.logs[0].args._prezzo.toNumber(), web3.toWei(articleprezzo2, "ether"), "l'evento prezzo-articolo dovrebbe essere " + web3.toWei(articleprezzo2, "ether"));

      return catalogoIstanza.getNumeroDiArticoli();
    }).then(function(data) {
      assert.equal(data, 2, "il numero di articoli dovrebbe esssere 2");

      return catalogoIstanza.getArticoliPerLaVendita();
    }).then(function(data) {
      assert.equal(data.length, 2, "dovrebbero esserci 2 articoli per la vendita");
      assert.equal(data[1].toNumber(), 2, "gli articoli dovrebbe essere 2");

      return catalogoIstanza.articles(data[1]);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 2, "l'id dell'articolo dovrebbe essere 2");
      assert.equal(data[1], venditore, "il venditore dovrebbe essere " + venditore);
      assert.equal(data[2], 0x0, "l'acquirente dovrebbe essere vuoto");
      assert.equal(data[3], articleName2, "il nome dell'articolo dovrebbe essere " + articleName2);
      assert.equal(data[4], articledescrizione2, "la descrizione dell'articolo dovrebbe essere " + articledescrizione2);
      assert.equal(data[5].toNumber(), web3.toWei(articleprezzo2, "ether"), "il prezzo dell'articolo dovrebbe essere " + web3.toWei(articleprezzo2, "ether"));
    });
  });

  // comprare il primo articolo
  it("dovrebbe essere venduto un articolo", function(){
    return Catalogo.deployed().then(function(instance) {
      catalogoIstanza = instance;
      // record balances of venditore and acquirente before the buy
      venditoreBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(venditore), "ether").toNumber();
      acquirenteBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(acquirente), "ether").toNumber();
      return catalogoIstanza.compraArticolo(1, {
        from: acquirente,
        value: web3.toWei(articleprezzo1, "ether")
      });
    }).then(function(receipt){
      assert.equal(receipt.logs.length, 1, "un evento dovrebbe essere stato innescato");
      assert.equal(receipt.logs[0].event, "LogCompraArticolo", "l'evento dovrebbe essere LogCompraArticolo");
      assert.equal(receipt.logs[0].args._id.toNumber(), 1, "l'id dell'articolo dovrebbe essere 1");
      assert.equal(receipt.logs[0].args._venditore, venditore, "l'evento venditore dovrebbe essere " + venditore);
      assert.equal(receipt.logs[0].args._acquirente, acquirente, "l'evento acquirente dovrebbe essere " + acquirente);
      assert.equal(receipt.logs[0].args._name, articleName1, "l'evento nome-articolo dovrebbe essere " + articleName1);
      assert.equal(receipt.logs[0].args._prezzo.toNumber(), web3.toWei(articleprezzo1, "ether"), "l'evento prezzo-articolo dovrebbe essere " + web3.toWei(articleprezzo1, "ether"));

      // registrare i saldi dell'acquirente e del venditore dopo la transazione
      venditoreBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(venditore), "ether").toNumber();
      acquirenteBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(acquirente), "ether").toNumber();

      // controllo dell'effetto della vendita sul saldo del venditore, dell'acquirente e del gas speso
      assert(venditoreBalanceAfterBuy == venditoreBalanceBeforeBuy + articleprezzo1, "venditore dovrebbe aver acquisito " + articleprezzo1 + " ETH");
      assert(acquirenteBalanceAfterBuy <= acquirenteBalanceBeforeBuy - articleprezzo1, "acquirente dovrebbe aver speso " + articleprezzo1 + " ETH");

      return catalogoIstanza.getArticoliPerLaVendita();
    }).then(function(data){
      assert.equal(data.length, 1, "dovrebbe esserci solo 1 articolo per la vendita");
      assert.equal(data[0].toNumber(), 2, "l'articolo 2 dovrebbe essere l'unico articolo rimasto in vendita");

      return catalogoIstanza.getNumeroDiArticoli();
    }).then(function(data){
      assert.equal(data.toNumber(), 2, "ci dovrebbero essere ancora 2 articoli in totale");
    });
  });
});
