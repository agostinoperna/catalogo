pragma solidity ^0.4.18;

import "./Proprietario.sol";

contract Catalogo is Proprietario {
  // settare le variabili
  struct Article {
    uint id;
    address venditore;
    address acquirente;
    string name;
    string descrizione;
    uint256 prezzo;
  }

  // variabili di stato
  mapping (uint => Article) public articles;
  uint articoloCounter;

  // eventi
  event LogVendiArticolo(
    uint indexed _id,
    address indexed _venditore,
    string _name,
    uint256 _prezzo
  );
  event LogCompraArticolo(
    uint indexed _id,
    address indexed _venditore,
    address indexed _acquirente,
    string _name,
    uint256 _prezzo
  );

  // disattivare il contratto
  function kill() public onlyOwner {
    selfdestruct(owner);
  }

  // vendere un articolo
  function vendiArticolo(string _name, string _descrizione, uint256 _prezzo) public {
    // un nuovo articolo
    articoloCounter++;

    // salvare nell'array questo articolo
    articles[articoloCounter] = Article(
      articoloCounter,
      msg.sender,
      0x0,
      _name,
      _descrizione,
      _prezzo
    );

    LogVendiArticolo(articoloCounter, msg.sender, _name, _prezzo);
  }

  // recuperare il numero di articoli nel contratto
  function getNumeroDiArticoli() public view returns (uint) {
    return articoloCounter;
  }

  // recuperare tutti gli ID degli articoli che sono ancora in vendita
  function getArticoliPerLaVendita() public view returns (uint[]) {
    // preparare l'output per l'array
    uint[] memory articleIds = new uint[](articoloCounter);

    uint numeroDiArticoliPerLaVendita = 0;
    // iterazione sugli articoli
    for(uint i = 1; i <= articoloCounter;  i++) {
      // mantenere l'ID se l'articolo è ancora in vendita
      if(articles[i].acquirente == 0x0) {
        articleIds[numeroDiArticoliPerLaVendita] = articles[i].id;
        numeroDiArticoliPerLaVendita++;
      }
    }

    // copiare l'id dell'articolo in un array "per la vendita" più piccolo
    uint[] memory perLaVendita = new uint[](numeroDiArticoliPerLaVendita);
    for(uint j = 0; j < numeroDiArticoliPerLaVendita; j++) {
      perLaVendita[j] = articleIds[j];
    }
    return perLaVendita;
  }

  // comprare un articolo
  function compraArticolo(uint _id) payable public {
    // controllo se c'è un articolo per la vendita
    require(articoloCounter > 0);

    // controllo se esiste un articolo
    require(_id > 0 && _id <= articoloCounter);

    // recuperare un articolo
    Article storage article = articles[_id];

    // controllare se un articolo non è stato ancora venduto
    require(article.acquirente == 0X0);

    // non permettere al venditore di comprare un proprio articolo
    require(msg.sender != article.venditore);

    //controllare se il prezzo per acquistare un articolo corrisponde al prezzo di vendita
    require(msg.value == article.prezzo);

    // acquisire le info sull'acquirente
    article.acquirente = msg.sender;

    // l'acquirente può pagare il venditore
    article.venditore.transfer(msg.value);

    // innescare un evento
    LogCompraArticolo(_id, article.venditore, article.acquirente, article.name, article.prezzo);
  }
}
