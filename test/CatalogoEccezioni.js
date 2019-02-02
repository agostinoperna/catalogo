// contratto che deve essere testato
var Catalogo = artifacts.require("./Catalogo.sol");

// test suite
contract("Catalogo", function(accounts){
  var catalogoIstanza;
  var venditore = accounts[1];
  var acquirente = accounts[2];
  var articleName = "articolo 1";
  var articledescrizione = "descrizione per l'articolo 1";
  var articleprezzo = 10;

  // nessun articolo ancora in vendita
  it("dovrebbe scattare una eccezione se provi a comprare un articolo che ancora non è in vendita", function() {
    return Catalogo.deployed().then(function(instance) {
      catalogoIstanza = instance;
      return catalogoIstanza.compraArticolo(1, {
        from: acquirente,
        value: web3.toWei(articleprezzo, "ether")
      });
    }).then(assert.fail)
    .catch(function(error){
      assert(true);
    }).then(function() {
      return catalogoIstanza.getNumeroDiArticoli();
    }).then(function(data) {
      assert.equal(data.toNumber(), 0, "il numero degli articoli deve essere 0");
    });
  });

  // acquistare un articolo non ancora in vendita
  it("dovrebbe scattare una eccezione se provi a comprare un articolo che non esiste", function(){
    return Catalogo.deployed().then(function(instance){
      catalogoIstanza = instance;
      return catalogoIstanza.vendiArticolo(articleName, articledescrizione, web3.toWei(articleprezzo, "ether"), { from: venditore });
    }).then(function(receipt){
      return catalogoIstanza.compraArticolo(2, {from: venditore, value: web3.toWei(articleprezzo, "ether")});
    }).then(assert.fail)
    .catch(function(error) {
      assert(true);
    }).then(function() {
      return catalogoIstanza.articles(1);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 1, "l'id dell'articolo dovrebbe essere 1");
      assert.equal(data[1], venditore, "il venditore dovrebbe essere " + venditore);
      assert.equal(data[2], 0x0, "acquirente dovrebbe essere vuoto");
      assert.equal(data[3], articleName, "articolo dovrebbe essere " + articleName);
      assert.equal(data[4], articledescrizione, "la descrizione dell'articolo dovrebbe essere " + articledescrizione);
      assert.equal(data[5].toNumber(), web3.toWei(articleprezzo, "ether"), "il prezzo dell'articolo dovrebbe essere " + web3.toWei(articleprezzo, "ether"));
    });
  });

  // comprare un articolo di cui si è il proprietario
  it("dovrebbe scattare una eccezione se provi a comprare un tuo articolo", function() {
    return Catalogo.deployed().then(function(instance){
      catalogoIstanza = instance;

      return catalogoIstanza.compraArticolo(1, {from: venditore, value: web3.toWei(articleprezzo, "ether")});
    }).then(assert.fail)
    .catch(function(error){
      assert(true);
    }).then(function() {
      return catalogoIstanza.articles(1);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 1, "l'id dell'articolo dovrebbe essere 1");
      assert.equal(data[1], venditore, "il venditore dovrebbe essere " + venditore);
      assert.equal(data[2], 0x0, "acquirente dovrebbe essere vuoto");
      assert.equal(data[3], articleName, "articolo dovrebbe essere " + articleName);
      assert.equal(data[4], articledescrizione, "la descrizione dell'articolo dovrebbe essere " + articledescrizione);
      assert.equal(data[5].toNumber(), web3.toWei(articleprezzo, "ether"), "il prezzo dell'articolo dovrebbe essere " + web3.toWei(articleprezzo, "ether"));
    });
  });

  // valore non corretto
  it("dovrebbe scattare una eccezione se provi ad acquistare un articolo inserendo un prezzo differente da quello fissato", function() {
    return Catalogo.deployed().then(function(instance){
      catalogoIstanza = instance;
      return catalogoIstanza.compraArticolo(1, {from: acquirente, value: web3.toWei(articleprezzo + 1, "ether")});
    }).then(assert.fail)
    .catch(function(error){
      assert(true);
    }).then(function() {
      return catalogoIstanza.articles(1);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 1, "l'id dell'articolo dovrebbe essere 1");
      assert.equal(data[1], venditore, "il venditore dovrebbe essere " + venditore);
      assert.equal(data[2], 0x0, "acquirente dovrebbe essere vuoto");
      assert.equal(data[3], articleName, "il nome dell'articolo dovrebbe essere " + articleName);
      assert.equal(data[4], articledescrizione, "la descrizione dell'articolo dovrebbe essere " + articledescrizione);
      assert.equal(data[5].toNumber(), web3.toWei(articleprezzo, "ether"), "il prezzo dell'articolo dovrebbe essere " + web3.toWei(articleprezzo, "ether"));
    });
  });

  // l'articolo è stato già venduto
  it("dovrebbe scattare una eccezione se provi ad acquistare un articolo già venduto", function() {
    return Catalogo.deployed().then(function(instance){
      catalogoIstanza = instance;
      return catalogoIstanza.compraArticolo(1, {from: acquirente, value: web3.toWei(articleprezzo, "ether")});
    }).then(function(){
      return catalogoIstanza.compraArticolo(1, {from: web3.eth.accounts[0], value: web3.toWei(articleprezzo, "ether")});
    }).then(assert.fail)
    .catch(function(error){
      assert(true);
    }).then(function() {
      return catalogoIstanza.articles(1);
    }).then(function(data) {
      assert.equal(data[0].toNumber(), 1, "l'id dell'articolo dovrebbe essere 1");
      assert.equal(data[1], venditore, "il venditore dovrebbe essere " + venditore);
      assert.equal(data[2], acquirente, "l'acquirente dovrebbe essere " + acquirente);
      assert.equal(data[3], articleName, "il nome dell'articolo dovrebbe essere " + articleName);
      assert.equal(data[4], articledescrizione, "la descrizione dell'articolo dovrebbe essere " + articledescrizione);
      assert.equal(data[5].toNumber(), web3.toWei(articleprezzo, "ether"), "il prezzo dell'articolo dovrebbe essere " + web3.toWei(articleprezzo, "ether"));
    });
  });
});
